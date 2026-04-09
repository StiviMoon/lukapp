/**
 * Hook para manejar cola de transacciones offline + sincronización automática
 * - Detecta conectividad vía navigator.onLine
 * - Escucha eventos online/offline del navegador
 * - Escucha mensajes del Service Worker (Background Sync)
 * - Auto-flush cuando vuelve la conexión
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import {
  insertTransaction,
  updateStatus,
  deleteTransaction,
  getAllPending,
  getAllFailed,
  getStatusCounts,
  clearAllFailed,
  type OfflineTransactionPayload,
  type PendingTransaction,
} from "@/lib/idb/offline-transactions";

export type { OfflineTransactionPayload, PendingTransaction };

export interface UseOfflineQueueReturn {
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  enqueue: (payload: OfflineTransactionPayload) => Promise<string>;
  flushPending: () => Promise<void>;
  retryFailed: () => Promise<void>;
  clearFailed: () => Promise<void>;
}

export function useOfflineQueue(): UseOfflineQueueReturn {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const isFlushing = useRef(false);

  // Actualizar conteos
  const updateCounts = useCallback(async () => {
    try {
      const counts = await getStatusCounts();
      setPendingCount(counts.pending);
      setFailedCount(counts.failed);
    } catch (err) {
      console.error("[useOfflineQueue] Error updating counts:", err);
    }
  }, []);

  // Sincronizar una transacción específica
  const syncTransaction = useCallback(
    async (tx: PendingTransaction): Promise<boolean> => {
      try {
        await updateStatus(tx.localId, "syncing");

        const res = await api.voice.save(tx.payload);

        if (res.success) {
          await deleteTransaction(tx.localId);
          return true;
        } else {
          // Falló la API pero sin error de conexión — retry limitado
          const newRetryCount = tx.retryCount + 1;
          if (newRetryCount >= 3) {
            await updateStatus(tx.localId, "failed", newRetryCount);
          } else {
            await updateStatus(tx.localId, "pending", newRetryCount);
          }
          return false;
        }
      } catch (err) {
        console.error("[useOfflineQueue] Sync error for", tx.localId, err);
        const newRetryCount = tx.retryCount + 1;
        await updateStatus(tx.localId, "pending", newRetryCount);
        return false;
      }
    },
    []
  );

  // Encolar una nueva transacción
  const enqueue = useCallback(
    async (payload: OfflineTransactionPayload): Promise<string> => {
      try {
        const localId = await insertTransaction(payload);
        await updateCounts();

        // Si está online, intentar sincronizar inmediatamente
        if (isOnline) {
          const tx = await insertTransaction(payload);
          if (tx) {
            // Delete la que ya insertamos porque vamos a intentar sync
            await deleteTransaction(localId);
            const res = await api.voice.save(payload);
            if (res.success) {
              await updateCounts();
              return localId;
            }
            // Si falla, volver a insertar
            await insertTransaction(payload);
          }
        }

        return localId;
      } catch (err) {
        console.error("[useOfflineQueue] Enqueue error:", err);
        throw err;
      }
    },
    [isOnline, updateCounts]
  );

  // Sincronizar todos los pendientes
  const flushPending = useCallback(async (): Promise<void> => {
    if (isFlushing.current) return;
    isFlushing.current = true;

    try {
      const pending = await getAllPending();
      if (pending.length === 0) {
        isFlushing.current = false;
        return;
      }

      console.log(`[useOfflineQueue] Flushing ${pending.length} pending transactions`);

      const results = await Promise.allSettled(
        pending.map((tx) => syncTransaction(tx))
      );

      const successful = results.filter((r) => r.status === "fulfilled" && r.value).length;
      console.log(`[useOfflineQueue] Synced ${successful}/${pending.length}`);

      await updateCounts();
      if (successful > 0) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["transactions"] }),
          queryClient.invalidateQueries({ queryKey: ["balance"] }),
          queryClient.invalidateQueries({ queryKey: ["stats"] }),
          queryClient.invalidateQueries({ queryKey: ["budget-projection"] }),
          queryClient.invalidateQueries({ queryKey: ["analytics", "summary"] }),
          queryClient.invalidateQueries({ queryKey: ["analytics", "recurring"] }),
        ]);
      }

      // Toast informativo si hay pendientes aun
      const stillPending = await getAllPending();
      if (stillPending.length === 0) {
        toast.success("✓ Sincronizado");
      }
    } catch (err) {
      console.error("[useOfflineQueue] Flush error:", err);
    } finally {
      isFlushing.current = false;
    }
  }, [syncTransaction, updateCounts, queryClient]);

  // Reintentar transacciones fallidas
  const retryFailed = useCallback(async (): Promise<void> => {
    try {
      const failed = await getAllFailed();
      if (failed.length === 0) return;

      console.log(`[useOfflineQueue] Retrying ${failed.length} failed transactions`);

      // Resetear retryCount a 0 para nuevo intento
      const toRetry = failed.map((tx) => ({ ...tx, retryCount: 0 }));

      await Promise.allSettled(toRetry.map((tx) => syncTransaction(tx)));
      await updateCounts();
    } catch (err) {
      console.error("[useOfflineQueue] Retry error:", err);
    }
  }, [syncTransaction, updateCounts]);

  // Limpiar transacciones fallidas
  const clearFailed = useCallback(async (): Promise<void> => {
    try {
      await clearAllFailed();
      await updateCounts();
      toast.success("✓ Transacciones fallidas eliminadas");
    } catch (err) {
      console.error("[useOfflineQueue] Clear failed error:", err);
    }
  }, [updateCounts]);

  // Listener de conectividad
  useEffect(() => {
    const handleOnline = () => {
      console.log("[useOfflineQueue] Back online");
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("[useOfflineQueue] Gone offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Escuchar mensajes del Service Worker (Background Sync)
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_PENDING") {
        console.log("[useOfflineQueue] Received SYNC_PENDING from SW");
        flushPending();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSWMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    };
  }, [flushPending]);

  // Auto-flush cuando vuelve online
  useEffect(() => {
    if (isOnline) {
      // Defer el flush para que no compita con otras operaciones
      const timer = setTimeout(() => flushPending(), 500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, flushPending]);

  // Actualizar conteos iniciales
  useEffect(() => {
    updateCounts();
  }, [updateCounts]);

  return {
    isOnline,
    pendingCount,
    failedCount,
    enqueue,
    flushPending,
    retryFailed,
    clearFailed,
  };
}
