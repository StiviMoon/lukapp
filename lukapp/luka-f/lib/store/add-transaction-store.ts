import { create } from "zustand";

interface AddTransactionState {
  isOpen: boolean;
  defaultType: "INCOME" | "EXPENSE";
  open: (type: "INCOME" | "EXPENSE") => void;
  close: () => void;
}

export const useAddTransactionStore = create<AddTransactionState>((set) => ({
  isOpen: false,
  defaultType: "EXPENSE",
  open: (type) => set({ isOpen: true, defaultType: type }),
  close: () => set({ isOpen: false }),
}));
