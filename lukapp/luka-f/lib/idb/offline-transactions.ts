/**
 * IndexedDB helper para transacciones offline
 * - Cero dependencias externas (IDB nativa)
 * - Funciones puras, promisificadas
 */

const DB_NAME = "lukapp-offline-v1";
const DB_VERSION = 1;
const STORE_NAME = "pending_transactions";

export interface OfflineTransactionPayload {
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string;
  suggestedCategoryName: string;
  categoryId: string | null;
  accountId: string | null;
  date: string;
}

export interface PendingTransaction {
  localId: string;
  createdAt: number;
  syncStatus: "pending" | "syncing" | "failed";
  retryCount: number;
  payload: OfflineTransactionPayload;
}

/**
 * Abre la base de datos IndexedDB, crea los stores si es necesario
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "localId" });
        store.createIndex("createdAt", "createdAt", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }
    };
  });
}

/**
 * Obtiene todos los registros con un estado de sync específico
 */
export async function getPendingByStatus(
  status: "pending" | "syncing" | "failed"
): Promise<PendingTransaction[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const idx = store.index("syncStatus");
      const req = idx.getAll(status);

      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  } catch (err) {
    console.error("[IDB] Error fetching by status:", err);
    return [];
  }
}

/**
 * Obtiene todos los registros pendientes (sin sincronizar)
 */
export async function getAllPending(): Promise<PendingTransaction[]> {
  return getPendingByStatus("pending");
}

/**
 * Obtiene todos los registros fallidos (que requieren retry)
 */
export async function getAllFailed(): Promise<PendingTransaction[]> {
  return getPendingByStatus("failed");
}

/**
 * Obtiene un registro específico por localId
 */
export async function getTransaction(localId: string): Promise<PendingTransaction | undefined> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(localId);

      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  } catch (err) {
    console.error("[IDB] Error fetching transaction:", err);
    return undefined;
  }
}

/**
 * Inserta una nueva transacción pendiente en la base de datos
 */
export async function insertTransaction(
  payload: OfflineTransactionPayload
): Promise<string> {
  const localId = crypto.randomUUID();
  const record: PendingTransaction = {
    localId,
    createdAt: Date.now(),
    syncStatus: "pending",
    retryCount: 0,
    payload,
  };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(record);

      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(localId);
    });
  } catch (err) {
    console.error("[IDB] Error inserting transaction:", err);
    throw err;
  }
}

/**
 * Actualiza el estado de sincronización de una transacción
 */
export async function updateStatus(
  localId: string,
  status: "pending" | "syncing" | "failed",
  retryCount?: number
): Promise<void> {
  try {
    const db = await openDB();
    const record = await getTransaction(localId);
    if (!record) return;

    record.syncStatus = status;
    if (retryCount !== undefined) record.retryCount = retryCount;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  } catch (err) {
    console.error("[IDB] Error updating status:", err);
  }
}

/**
 * Elimina una transacción de la base de datos (después de sincronizar)
 */
export async function deleteTransaction(localId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(localId);

      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  } catch (err) {
    console.error("[IDB] Error deleting transaction:", err);
  }
}

/**
 * Elimina todas las transacciones fallidas
 */
export async function clearAllFailed(): Promise<void> {
  try {
    const failed = await getAllFailed();
    await Promise.all(failed.map((t) => deleteTransaction(t.localId)));
  } catch (err) {
    console.error("[IDB] Error clearing failed:", err);
  }
}

/**
 * Obtiene un conteo de transacciones por status
 */
export async function getStatusCounts(): Promise<{
  pending: number;
  syncing: number;
  failed: number;
}> {
  try {
    const [pending, syncing, failed] = await Promise.all([
      getPendingByStatus("pending"),
      getPendingByStatus("syncing"),
      getPendingByStatus("failed"),
    ]);

    return {
      pending: pending.length,
      syncing: syncing.length,
      failed: failed.length,
    };
  } catch (err) {
    console.error("[IDB] Error getting counts:", err);
    return { pending: 0, syncing: 0, failed: 0 };
  }
}
