export interface ContactUser {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface Contact {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  other: ContactUser;
  isSender: boolean;
}

export interface SpaceMember {
  id: string;
  userId: string;
  salary: string | null;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
  profile: ContactUser;
}

export interface SharedBudget {
  id: string;
  categoryName: string;
  percentage: string;
  period: string;
}

export interface SharedTransaction {
  id: string;
  amount: string;
  description?: string | null;
  date: string;
  authorId: string;
  author: ContactUser;
  sharedBudgetId: string | null;
  sharedBudget?: { categoryName: string } | null;
}

export interface SharedSpace {
  id: string;
  name: string;
  createdBy: string;
  deletionRequestedBy: string | null;
  members: SpaceMember[];
  budgets: SharedBudget[];
  createdAt: string;
  updatedAt: string;
}

export interface SharedBudgetStatus {
  budget: SharedBudget;
  myContrib: number;
  partnerContrib: number;
  totalBudget: number;
  spent: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
}

export interface SpaceStatusResponse {
  budgetStatuses: SharedBudgetStatus[];
  mySalary: number;
  partnerSalary: number;
  myTotalDeductions: number;
  partnerTotalDeductions: number;
  myAvailableSalary: number;
  partnerAvailableSalary: number;
  myRatio: number;
  partnerProfile: { userId: string; fullName: string | null; email: string | null } | null;
}

export interface SharedOverview {
  totalMyDeductions: number;
  spaces: Array<{
    id: string;
    name: string;
    myDeductions: number;
    transactionCount: number;
    partnerName: string;
  }>;
}
