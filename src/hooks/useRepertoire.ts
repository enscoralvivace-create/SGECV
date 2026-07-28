"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createRepertoireItem,
  getRepertoire,
  updateRepertoireItem,
  updateRepertoireStatus,
} from "@/services/repertoireService";

import type {
  RepertoireFormData,
  RepertoireItem,
  RepertoireStatus,
} from "@/types/repertoire";

export function useRepertoire() {
  const [repertoire, setRepertoire] =
    useState<RepertoireItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshRepertoire =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data = await getRepertoire();

console.log(
  "Repertorio recibido desde Supabase:",
  data,
);

setRepertoire(data);
      } catch (loadError) {
        const errorMessage =
          loadError instanceof Error
            ? loadError.message
            : "No fue posible cargar el repertorio.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void refreshRepertoire();
  }, [refreshRepertoire]);

  async function createItem(
    form: RepertoireFormData,
  ): Promise<boolean> {
    setError(null);

    try {
      await createRepertoireItem(form);
      await refreshRepertoire();

      return true;
    } catch (createError) {
      const errorMessage =
        createError instanceof Error
          ? createError.message
          : "No fue posible guardar la obra.";

      setError(errorMessage);

      return false;
    }
  }

  async function updateItem(
    id: number,
    form: RepertoireFormData,
  ): Promise<boolean> {
    setError(null);

    try {
      await updateRepertoireItem(id, form);
      await refreshRepertoire();

      return true;
    } catch (updateError) {
      const errorMessage =
        updateError instanceof Error
          ? updateError.message
          : "No fue posible actualizar la obra.";

      setError(errorMessage);

      return false;
    }
  }

  async function changeStatus(
    id: number,
    status: RepertoireStatus,
  ): Promise<boolean> {
    setError(null);

    try {
      await updateRepertoireStatus(
        id,
        status,
      );

      await refreshRepertoire();

      return true;
    } catch (statusError) {
      const errorMessage =
        statusError instanceof Error
          ? statusError.message
          : "No fue posible cambiar el estado de la obra.";

      setError(errorMessage);

      return false;
    }
  }

  return {
    repertoire,
    loading,
    error,
    refreshRepertoire,
    createItem,
    updateItem,
    changeStatus,
  };
}