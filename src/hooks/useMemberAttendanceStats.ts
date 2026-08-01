"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMemberAttendanceStats,
} from "@/services/memberAttendanceStatsService";

import type {
  MemberAttendanceStats,
  MemberAttendanceStatsFilters,
} from "@/types/memberAttendanceStats";

interface UseMemberAttendanceStatsResult {
  stats: MemberAttendanceStats | null;
  filters: MemberAttendanceStatsFilters;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
  setFilters: (
    filters: MemberAttendanceStatsFilters,
  ) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS:
MemberAttendanceStatsFilters = {
  startDate: "",
  endDate: "",
  recentLimit: 12,
};

export default function useMemberAttendanceStats(
  memberId: number | null,
  initialFilters?: MemberAttendanceStatsFilters,
): UseMemberAttendanceStatsResult {
  const normalizedInitialFilters =
    useMemo(
      () => ({
        ...DEFAULT_FILTERS,
        ...initialFilters,
      }),
      [initialFilters],
    );

  const [
    stats,
    setStats,
  ] =
    useState<MemberAttendanceStats | null>(
      null,
    );

  const [
    filters,
    setFiltersState,
  ] =
    useState<MemberAttendanceStatsFilters>(
      normalizedInitialFilters,
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(
    memberId !== null,
  );

  const [
    error,
    setError,
  ] = useState("");

  const reload =
    useCallback(async (): Promise<void> => {
      if (
        memberId === null ||
        memberId <= 0
      ) {
        setStats(null);
        setIsLoading(false);
        setError("");
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const result =
          await getMemberAttendanceStats(
            memberId,
            filters,
          );

        setStats(result);
      } catch (loadError: unknown) {
        console.error(loadError);

        setStats(null);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No fue posible cargar las estadísticas de asistencia.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      filters,
      memberId,
    ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setFilters =
    useCallback(
      (
        nextFilters:
          MemberAttendanceStatsFilters,
      ): void => {
        setFiltersState(
          (currentFilters) => ({
            ...currentFilters,
            ...nextFilters,
          }),
        );
      },
      [],
    );

  const clearFilters =
    useCallback((): void => {
      setFiltersState({
        ...DEFAULT_FILTERS,
      });
    }, []);

  return {
    stats,
    filters,
    isLoading,
    error,
    reload,
    setFilters,
    clearFilters,
  };
}