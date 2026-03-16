"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/api/client";
import { toast } from "sonner";

export const useApiQuery = <T>({
  queryKey,
  endpoint,
  params,
  enabled = true,
}: {
  queryKey: string[];
  endpoint: string;
  params?: Record<string, any>;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get<T>(endpoint, params);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? "Error en la petición");
      }

      return response.data;
    },
    enabled,
    retry: 1,
  });
};

export const useApiMutation = <TData, TVariables = any>({
  mutationFn,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  invalidateQueries = [],
}: {
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[][];
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await mutationFn(variables);

      if (!response.success || !response.data) {
        const error = new Error(
          response.error?.message ?? errorMessage ?? "Error en la operación"
        );
        throw error;
      }

      return response.data;
    },
    onSuccess: (data) => {
      if (successMessage) {
        toast.success(successMessage);
      }

      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      onError?.(error);
    },
  });
};

