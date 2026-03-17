import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number; // ms — 0 = persistente hasta dismiss manual
}

interface ToastStore {
  toasts: ToastItem[];
  add:    (item: Omit<ToastItem, "id">) => string;
  remove: (id: string) => void;
  clear:  () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (item) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set(s => ({
      // máximo 3 toasts visibles — descarta el más viejo si hay más
      toasts: [...s.toasts.slice(-2), { ...item, id }],
    }));
    return id;
  },

  remove: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}));
