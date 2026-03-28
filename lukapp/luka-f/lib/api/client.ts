import { createClient } from "@/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
  };
};

/** Respuesta de GET /subscription/pricing (centavos COP) */
export type SubscriptionPricingPayload = {
  monthly: {
    billingCycle: "MONTHLY" | "YEARLY";
    baseAmountCents: number;
    finalAmountCents: number;
    discountPercent: number;
    durationDays: number;
    equivalentMonthlyCents?: number;
  };
  yearly: {
    billingCycle: "MONTHLY" | "YEARLY";
    baseAmountCents: number;
    finalAmountCents: number;
    discountPercent: number;
    durationDays: number;
    equivalentMonthlyCents?: number;
  };
};

export type CheckoutResponse = {
  paymentUrl: string;
  reference: string;
  amountCents: number;
  billingCycle: "MONTHLY" | "YEARLY";
};

export type AnalyticsSummary = {
  health: {
    score: number;
    level: "estable" | "riesgo" | "alerta";
    reasons: string[];
  };
  today: {
    insight: string;
    action: string;
  };
  balances: {
    available: number;
    monthlyIncome: number;
    monthlyExpense: number;
    monthlyNet: number;
    burnRateDaily: number;
    runwayDays: number | null;
  };
  forecast: {
    next30Days: number;
    next60Days: number;
    next90Days: number;
    confidence: "alta" | "media" | "baja";
    trendDaily: number;
  };
  alerts: string[];
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      return session?.access_token ?? null;
    } catch (error) {
      console.error("Error obteniendo token de autenticación:", error);
      return null;
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const url = `${this.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error ?? {
            message: `Error ${response.status}: ${response.statusText}`,
            code: "HTTP_ERROR",
          },
        };
      }

      return data;
    } catch (error) {
      console.error("Error en petición API:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Error desconocido",
          code: "NETWORK_ERROR",
        },
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            searchParams.append(key, value.toISOString());
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      url = `${endpoint}?${searchParams.toString()}`;
    }

    return this.request<T>(url, {
      method: "GET",
    });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();

export const api = {
  accounts: {
    getAll: (params?: { includeInactive?: boolean; type?: string }) =>
      apiClient.get("/accounts", params),
    getById: (id: string) => apiClient.get(`/accounts/${id}`),
    create: (data: unknown) => apiClient.post("/accounts", data),
    update: (id: string, data: unknown) =>
      apiClient.put(`/accounts/${id}`, data),
    delete: (id: string, hardDelete?: boolean) =>
      apiClient.delete(`/accounts/${id}${hardDelete ? "?hardDelete=true" : ""}`),
    getTotalBalance: () => apiClient.get("/accounts/balance/total"),
  },

  transactions: {
    getAll: (params?: {
      accountId?: string;
      categoryId?: string;
      type?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }) => apiClient.get("/transactions", params),
    getById: (id: string) => apiClient.get(`/transactions/${id}`),
    create: (data: unknown) => apiClient.post("/transactions", data),
    update: (id: string, data: unknown) =>
      apiClient.put(`/transactions/${id}`, data),
    delete: (id: string) => apiClient.delete(`/transactions/${id}`),
    getStats: (params?: { startDate?: Date; endDate?: Date }) =>
      apiClient.get("/transactions/stats", params),
  },

  categories: {
    getAll: (params?: { type?: string }) =>
      apiClient.get("/categories", params),
    getById: (id: string) => apiClient.get(`/categories/${id}`),
    create: (data: unknown) => apiClient.post("/categories", data),
    update: (id: string, data: unknown) =>
      apiClient.put(`/categories/${id}`, data),
    delete: (id: string) => apiClient.delete(`/categories/${id}`),
  },

  budgets: {
    getAll: (params?: { categoryId?: string; activeOnly?: boolean }) =>
      apiClient.get("/budgets", params),
    getById: (id: string) => apiClient.get(`/budgets/${id}`),
    create: (data: unknown) => apiClient.post("/budgets", data),
    update: (id: string, data: unknown) =>
      apiClient.put(`/budgets/${id}`, data),
    delete: (id: string) => apiClient.delete(`/budgets/${id}`),
    getStatus: (date?: Date) =>
      apiClient.get("/budgets/status", date ? { date } : undefined),
  },

  voice: {
    parse: (data: {
      transcript: string;
      categories?: Array<{ id: string; name: string; type: string }>;
      accounts?: Array<{ id: string; name: string; type: string }>;
    }) =>
      apiClient.post<
        Array<{
          type: "INCOME" | "EXPENSE";
          amount: number;
          suggestedCategoryName: string;
          categoryId: string | null;
          description: string;
          confidence: "high" | "medium" | "low";
        }>
      >("/voice/parse", data),

    save: (
      data:
        | {
            type: "INCOME" | "EXPENSE";
            amount: number;
            description?: string;
            suggestedCategoryName: string;
            categoryId?: string | null;
            accountId?: string | null;
            date?: string; // ISO con offset — hora local del usuario
          }
        | Array<{
            type: "INCOME" | "EXPENSE";
            amount: number;
            description?: string;
            suggestedCategoryName: string;
            categoryId?: string | null;
            accountId?: string | null;
            date?: string;
          }>
    ) => apiClient.post("/voice/save", data),
  },

  contacts: {
    getAll: () => apiClient.get("/contacts"),
    invite: (email: string) => apiClient.post("/contacts/invite", { email }),
    accept: (id: string) => apiClient.post(`/contacts/${id}/accept`),
    remove: (id: string) => apiClient.delete(`/contacts/${id}`),
  },

  spaces: {
    getAll: () => apiClient.get("/spaces"),
    getById: (id: string) => apiClient.get(`/spaces/${id}`),
    create: (data: { contactIds: string[]; name?: string; type?: "PAREJA" | "FAMILIAR" }) => apiClient.post("/spaces", data),
    updateSalary: (id: string, salary: number) => apiClient.put(`/spaces/${id}/salary`, { salary }),
    getStatus: (id: string) => apiClient.get(`/spaces/${id}/status`),
    createBudget: (id: string, data: { categoryName: string; percentage: number }) =>
      apiClient.post(`/spaces/${id}/budgets`, data),
    updateBudget: (id: string, budgetId: string, data: { categoryName?: string; percentage?: number }) =>
      apiClient.put(`/spaces/${id}/budgets/${budgetId}`, data),
    deleteBudget: (id: string, budgetId: string) => apiClient.delete(`/spaces/${id}/budgets/${budgetId}`),
    addTransaction: (id: string, data: { amount: number; sharedBudgetId?: string; description?: string; date?: string }) =>
      apiClient.post(`/spaces/${id}/transactions`, data),
    updateTransaction: (id: string, txId: string, data: { amount?: number; sharedBudgetId?: string | null; description?: string | null }) =>
      apiClient.put(`/spaces/${id}/transactions/${txId}`, data),
    getTransactions: (id: string) => apiClient.get(`/spaces/${id}/transactions`),
    deleteTransaction: (id: string, txId: string) => apiClient.delete(`/spaces/${id}/transactions/${txId}`),
    getOverview: () => apiClient.get("/spaces/overview"),
    requestDeletion: (id: string) => apiClient.post(`/spaces/${id}/request-deletion`),
    cancelDeletion: (id: string) => apiClient.post(`/spaces/${id}/cancel-deletion`),
    confirmDeletion: (id: string) => apiClient.delete(`/spaces/${id}/confirm-deletion`),
  },

  profile: {
    get: () => apiClient.get("/profile"),
    update: (data: { fullName?: string; currency?: string }) =>
      apiClient.put("/profile", data),
    updatePlan: (plan: "FREE" | "PREMIUM") =>
      apiClient.put("/profile/plan", { plan }),
    completeOnboarding: () => apiClient.post("/profile/onboarding/complete"),
  },

  coach: {
    getInsight: () => apiClient.get<{ content: string }>("/coach/insight"),
    /** Retorna un ReadableStream de SSE para el chat en streaming */
    streamChat: async (
      messages: { role: "user" | "assistant"; content: string }[]
    ): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";

      const response = await fetch(`${API_BASE_URL}/coach/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Error al conectar con el coach");
      }

      return response.body.getReader();
    },
  },

  analytics: {
    getSummary: () => apiClient.get<AnalyticsSummary>("/analytics/summary"),
  },

  savingGoals: {
    getAll: () => apiClient.get("/saving-goals"),
    create: (data: unknown) => apiClient.post("/saving-goals", data),
    update: (id: string, data: unknown) => apiClient.patch(`/saving-goals/${id}`, data),
    delete: (id: string) => apiClient.delete(`/saving-goals/${id}`),
  },

  subscription: {
    /** Público — sin sesión requerida */
    getPricing: () =>
      apiClient.get<SubscriptionPricingPayload>("/subscription/pricing"),
    checkout: (body: { billingCycle: "MONTHLY" | "YEARLY" }) =>
      apiClient.post<CheckoutResponse>("/subscription/checkout", body),
    getStatus: () => apiClient.get("/subscription/status"),
    cancelAutoRenew: () => apiClient.delete("/subscription/cancel"),
  },

  health: () => apiClient.get("/health"),
};

