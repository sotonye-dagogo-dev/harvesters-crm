import { useState, useCallback } from "react";
import { message as antdMessage } from "antd";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showErrorMessage?: boolean;
  showSuccessMessage?: boolean;
  successMessage?: string;
}

/**
 * Custom hook for API calls with proper response handling
 * Automatically handles the successResponse wrapper pattern
 */
export function useApi<T = unknown>(options: UseApiOptions<T> = {}) {
  const {
    onSuccess,
    onError,
    showErrorMessage = true,
    showSuccessMessage = false,
    successMessage = "Success",
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(
    async (url: string, fetchOptions?: RequestInit) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Request failed with status ${response.status}`
          );
        }

        const result = await response.json();

        // Handle successResponse wrapper pattern
        // API returns: { success: true, data: ..., message: ... }
        // Or sometimes just the data directly
        const data = result.data !== undefined ? result.data : result;

        setState({ data, loading: false, error: null });

        if (showSuccessMessage) {
          antdMessage.success(result.message || successMessage);
        }

        if (onSuccess) {
          onSuccess(data);
        }

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        if (showErrorMessage) {
          antdMessage.error(errorMessage);
        }

        if (onError) {
          onError(errorMessage);
        }

        throw error;
      }
    },
    [onSuccess, onError, showErrorMessage, showSuccessMessage, successMessage]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    fetchData,
    reset,
  };
}

/**
 * Helper function to safely extract data from API response
 * Handles both successResponse wrapper and direct data responses
 */
export function extractApiData<T = unknown>(response: unknown): T | null {
  if (!response) return null;

  // Type guard for object with data property
  if (typeof response === "object" && response !== null && "data" in response) {
    return (response as { data: T }).data;
  }

  // Handle direct data
  return response as T;
}

/**
 * Helper function to ensure array response
 * Useful for list endpoints that might return different structures
 */
export function ensureArray<T = unknown>(data: unknown): T[] {
  if (Array.isArray(data)) return data;

  // Type guard for object with data property
  if (typeof data === "object" && data !== null && "data" in data) {
    const dataValue = (data as { data: unknown }).data;
    if (Array.isArray(dataValue)) return dataValue as T[];
  }

  // Type guard for object with items property
  if (typeof data === "object" && data !== null && "items" in data) {
    const itemsValue = (data as { items: unknown }).items;
    if (Array.isArray(itemsValue)) return itemsValue as T[];
  }

  return [];
}
