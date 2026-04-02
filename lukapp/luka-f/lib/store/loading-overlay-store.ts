import { create } from "zustand";

interface LoadingOverlayState {
  visible: boolean;
  message: string;
  subtitle: string;
  show: (message: string, subtitle?: string) => void;
  hide: () => void;
}

let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Overlay global de carga con anti-flash:
 * - show() espera 200ms antes de aparecer → operaciones rápidas (<200ms) no muestran nada.
 * - hide() espera 350ms si el overlay aún no era visible → evita parpadeos instantáneos.
 * - Si el overlay ya está visible, hide() lo cierra de inmediato (con la animación de salida).
 */
export const useLoadingOverlay = create<LoadingOverlayState>((set, get) => ({
  visible: false,
  message: "",
  subtitle: "",

  show: (message, subtitle = "") => {
    // Cancelar un hide pendiente
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    // Actualizar mensaje inmediatamente (sin mostrar aún)
    set({ message, subtitle });
    // Solo mostrar si la operación tarda más de 200ms
    if (!showTimer) {
      showTimer = setTimeout(() => {
        showTimer = null;
        set({ visible: true });
      }, 200);
    }
  },

  hide: () => {
    // Cancelar un show pendiente → operación terminó antes de 200ms, no mostrar nada
    if (showTimer) { clearTimeout(showTimer); showTimer = null; set({ message: "", subtitle: "" }); return; }
    // Si ya está visible, cerrar inmediatamente (la animación de salida lo suaviza)
    if (get().visible) {
      set({ visible: false, message: "", subtitle: "" });
      return;
    }
    // Si no estaba visible pero hay un hide pendiente, ignorar
    if (hideTimer) return;
  },
}));
