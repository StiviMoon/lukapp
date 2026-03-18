export interface TransactionCategory {
  id: string;
  name: string;
  type: string;
}

export interface TransactionAccount {
  id: string;
  name: string;
  type: string;
}

export interface Account {
  id: string;
  name: string;
  type: "CASH" | "CHECKING" | "SAVINGS" | "CREDIT_CARD" | "INVESTMENT" | "OTHER";
  balance: string;
  color: string | null;
  icon: string | null;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: string; // comes as string from Prisma Decimal
  description?: string;
  date: string;
  createdAt: string;
  account: TransactionAccount;
  category: TransactionCategory | null;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  incomeCount: number;
  expenseCount: number;
}
