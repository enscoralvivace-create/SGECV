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
} from "@/types/repertoire";

interface UseRepertoireResult {
  repertoire: RepertoireItem[];
  loading: boolean;
  error: string | null;
  refreshRepertoire: () => Promise<void>;
  createItem: (
    form: RepertoireFormData,
  ) => Promise<boolean>;
  updateItem: (
    id: number,
    form: RepertoireFormData,
  ) => Promise<boolean>;
  changeStatus: (
    id: number,
    status: RepertoireFormData["status"],
  ) => Promise<boolean>;
}

export function useRepertoire(): UseRepertoireResult {
  const [repertoire, setRepertoire] = useState<
    RepertoireItem[]
  >([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const refreshRepertoire =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const items = await getRepertoire();

        setRepertoire(items);
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "No fue posible cargar el repertorio.";

        setError(message);
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
    try {
      setError(null);

      await createRepertoireItem(form);
      await refreshRepertoire();

      return true;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible agregar la obra.";

      setError(message);

      return false;
    }
  }

  async function updateItem(
    id: number,
    form: RepertoireFormData,
  ): Promise<boolean> {
    try {
      setError(null);

      await updateRepertoireItem(id, form);
      await refreshRepertoire();

      return true;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible actualizar la obra.";

      setError(message);

      return false;
    }
  }

  async function changeStatus(
    id: number,
    status: RepertoireFormData["status"],
  ): Promise<boolean> {
    try {
      setError(null);

      await updateRepertoireStatus(id, status);
      await refreshRepertoire();

      return true;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No fue posible cambiar el estado.";

      setError(message);

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