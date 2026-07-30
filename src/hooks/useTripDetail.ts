"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getTripById,
} from "@/services/tripService";

import type {
  Trip,
} from "@/types/trip";

interface UseTripDetailResult {
  trip: Trip | null;

  loading: boolean;

  error: string | null;

  refreshTrip:
    () => Promise<void>;
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return (
    "No fue posible cargar la información " +
    "del viaje."
  );
}

export function useTripDetail(
  tripId: string,
): UseTripDetailResult {
  const [
    trip,
    setTrip,
  ] = useState<Trip | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const refreshTrip =
    useCallback(async (): Promise<void> => {
      const requestId =
        requestIdRef.current + 1;

      requestIdRef.current = requestId;

      setLoading(true);
      setError(null);

      try {
        const tripData =
          await getTripById(tripId);

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setTrip(tripData);
      } catch (loadError) {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setTrip(null);
        setError(
          getErrorMessage(loadError),
        );
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    }, [tripId]);

  useEffect(() => {
    void refreshTrip();

    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshTrip]);

  return {
    trip,
    loading,
    error,
    refreshTrip,
  };
}