"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface UseReportLoaderOptions {
  loadOnMount?: boolean;
}

interface UseReportLoaderResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
  setData: React.Dispatch<
    React.SetStateAction<T | null>
  >;
}

export default function useReportLoader<T>(
  loader: () => Promise<T>,
  options: UseReportLoaderOptions = {},
): UseReportLoaderResult<T> {
  const {
    loadOnMount = true,
  } = options;

  const [data, setData] =
    useState<T | null>(null);

  const [isLoading, setIsLoading] =
    useState(loadOnMount);

  const [error, setError] =
    useState("");

  const isMountedRef =
    useRef(false);

  const requestIdRef =
    useRef(0);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const reload = useCallback(
    async (): Promise<void> => {
      const requestId =
        requestIdRef.current + 1;

      requestIdRef.current =
        requestId;

      if (isMountedRef.current) {
        setIsLoading(true);
        setError("");
      }

      try {
        const result =
          await loader();

        if (
          isMountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          setData(result);
        }
      } catch (loadError: unknown) {
        console.error(loadError);

        if (
          isMountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No fue posible cargar la información del reporte.",
          );
        }
      } finally {
        if (
          isMountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          setIsLoading(false);
        }
      }
    },
    [loader],
  );

  useEffect(() => {
    if (!loadOnMount) {
      return;
    }

    void reload();
  }, [
    loadOnMount,
    reload,
  ]);

  return {
    data,
    isLoading,
    error,
    reload,
    setData,
  };
}
