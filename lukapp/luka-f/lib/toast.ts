/**
 * API de notificaciones — reemplaza sonner.
 * Misma interfaz: toast.success(), toast.error(), toast.warning(), toast.info(), toast.loading()
 * Compatible con llamadas fuera de componentes React.
 */
import { useToastStore, type ToastType } from "@/lib/store/toast-store";

const DURATION: Record<ToastType, number> = {
  success: 3200,
  error:   5000,
  warning: 4500,
  info:    4000,
  loading: 0,    // persiste hasta dismiss manual
};

function add(type: ToastType, message: string, opts?: { duration?: number }): string {
  const duration = opts?.duration ?? DURATION[type];
  return useToastStore.getState().add({ type, message, duration });
}

export const toast = {
  success: (message: string, opts?: { duration?: number }) => add("success", message, opts),
  error:   (message: string, opts?: { duration?: number }) => add("error",   message, opts),
  warning: (message: string, opts?: { duration?: number }) => add("warning", message, opts),
  info:    (message: string, opts?: { duration?: number }) => add("info",    message, opts),
  loading: (message: string, opts?: { duration?: number }) => add("loading", message, opts),

  dismiss: (id?: string) => {
    if (id) useToastStore.getState().remove(id);
    else    useToastStore.getState().clear();
  },
};
