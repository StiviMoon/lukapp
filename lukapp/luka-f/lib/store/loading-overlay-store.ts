import { create } from "zustand";

interface LoadingOverlayState {
  visible: boolean;
  message: string;
  show: (message: string) => void;
  hide: () => void;
}

export const useLoadingOverlay = create<LoadingOverlayState>((set) => ({
  visible: false,
  message: "",
  show: (message) => set({ visible: true, message }),
  hide: () => set({ visible: false, message: "" }),
}));
