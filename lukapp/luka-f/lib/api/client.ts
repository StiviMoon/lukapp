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

  health: () => apiClient.get("/health"),
};

