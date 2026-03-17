import { create } from "zustand";
import type { Transaction } from "@/lib/types/transaction";

interface AddTransactionState {
  isOpen: boolean;
  defaultType: "INCOME" | "EXPENSE";
  editingTransaction: Transaction | null;
  open: (type: "INCOME" | "EXPENSE") => void;
  openEdit: (tx: Transaction) => void;
  close: () => void;
}

export const useAddTransactionStore = create<AddTransactionState>((set) => ({
  isOpen: false,
  defaultType: "EXPENSE",
  editingTransaction: null,
  open: (type) => set({ isOpen: true, defaultType: type, editingTransaction: null }),
  openEdit: (tx) =>
    set({
      isOpen: true,
      defaultType: tx.type,
      editingTransaction: tx,
    }),
  close: () => set({ isOpen: false, editingTransaction: null }),
}));
