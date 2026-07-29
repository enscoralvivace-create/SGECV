"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createTrip,
  getTrips,
  updateTrip,
  updateTripStatus,
} from "@/services/tripService";

import type {
  Trip,
  TripFormData,
  TripStatus,
} from "@/types/trip";

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshTrips =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getTrips();

        setTrips(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar los viajes.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void refreshTrips();
  }, [refreshTrips]);

  async function createItem(
    form: TripFormData,
  ) {
    await createTrip(form);
    await refreshTrips();
  }

  async function updateItem(
    id: string,
    form: TripFormData,
  ) {
    await updateTrip(id, form);
    await refreshTrips();
  }

  async function changeStatus(
    id: string,
    status: TripStatus,
  ) {
    await updateTripStatus(
      id,
      status,
    );

    await refreshTrips();
  }

  return {
    trips,
    loading,
    error,

    refreshTrips,

    createItem,

    updateItem,

    changeStatus,
  };
}