import { message } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for debouncing values
 * Useful for search inputs, API calls, etc.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // API call with debounced value
 *   searchAPI(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for API requests with loading and error states
 *
 * @returns Object with fetch function and states
 *
 * @example
 * const { data, loading, error, fetchData } = useApiRequest();
 *
 * useEffect(() => {
 *   fetchData('/api/users');
 * }, []);
 */
export function useApiRequest<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (url: string, options?: RequestInit) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Request failed");
      }

      setData(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}

/**
 * Custom hook for handling form submissions with loading state
 *
 * @param onSubmit - Async function to execute on form submit
 * @returns Object with submit handler and loading state
 *
 * @example
 * const { handleSubmit, loading } = useFormSubmit(async (values) => {
 *   await saveData(values);
 * });
 */
export function useFormSubmit<T>(onSubmit: (values: T) => Promise<void>) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: T) => {
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading };
}

/**
 * Custom hook for pagination state management
 *
 * @param initialPage - Initial page number (default: 1)
 * @param initialPageSize - Initial page size (default: 20)
 * @returns Pagination state and handlers
 *
 * @example
 * const { page, pageSize, handlePageChange, reset } = usePagination();
 */
export function usePagination(
  initialPage: number = 1,
  initialPageSize: number = 20
) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const reset = () => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  };

  return { page, pageSize, handlePageChange, reset };
}

/**
 * Custom hook for managing modal/drawer visibility
 *
 * @param initialState - Initial visibility state (default: false)
 * @returns State and toggle functions
 *
 * @example
 * const { visible, open, close, toggle } = useModal();
 */
export function useModal(initialState: boolean = false) {
  const [visible, setVisible] = useState(initialState);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible((prev) => !prev), []);

  return { visible, open, close, toggle };
}

/**
 * Custom hook for local storage with serialization
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  const removeValue = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

/**
 * Custom hook for detecting click outside an element
 *
 * @param callback - Function to call when clicking outside
 * @returns Ref to attach to the element
 *
 * @example
 * const ref = useClickOutside(() => setMenuOpen(false));
 * <div ref={ref}>Menu content</div>
 */
export function useClickOutside<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [callback]);

  return ref;
}

/**
 * Custom hook for keyboard shortcuts
 *
 * @param key - Key to listen for (e.g., 'Escape', 'Enter')
 * @param callback - Function to call when key is pressed
 * @param deps - Dependencies array for callback
 *
 * @example
 * useKeyPress('Escape', () => closeModal());
 */
export function useKeyPress(
  key: string,
  callback: () => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps]);
}

/**
 * Custom hook for window size
 *
 * @returns Current window dimensions
 *
 * @example
 * const { width, height } = useWindowSize();
 * const isMobile = width < 768;
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
