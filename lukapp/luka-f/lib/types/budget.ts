export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: string;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
}

export interface BudgetStatus {
  id: string;
  amount: string;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate: string;
  category: { id: string; name: string } | null;
  spent: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
}

export interface CreateBudgetPayload {
  categoryId?: string;
  amount: number;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate: string;
}
