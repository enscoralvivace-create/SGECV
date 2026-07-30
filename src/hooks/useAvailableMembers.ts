"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMembers,
} from "@/services/memberService";

import type {
  Member,
} from "@/types/member";

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible cargar los integrantes.";
}

export function useAvailableMembers() {
  const [
    members,
    setMembers,
  ] = useState<Member[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const refreshMembers =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await getMembers();

        setMembers(data);
      } catch (loadError) {
        setError(
          getErrorMessage(loadError),
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

  return {
    members,
    loading,
    error,
    refreshMembers,
  };
}