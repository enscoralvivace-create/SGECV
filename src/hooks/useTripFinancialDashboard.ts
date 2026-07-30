"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getTripFinancialSummary,
} from "@/services/tripService";

import type {
  TripFinancialDashboardMetrics,
  TripFinancialSummary,
  TripMemberFinancialStatus,
  TripParticipantFinancialSummary,
} from "@/types/tripFinancial";

interface UseTripFinancialDashboardResult {
  summary: TripFinancialSummary | null;

  participants:
    TripParticipantFinancialSummary[];

  metrics: TripFinancialDashboardMetrics;

  loading: boolean;

  error: string | null;

  refreshFinancialDashboard:
    () => Promise<void>;
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return (
    "No fue posible cargar el dashboard " +
    "financiero del viaje."
  );
}

function getFinancialStatus(
  totalCharged: number,
  totalPaid: number,
): TripMemberFinancialStatus {
  if (
    totalCharged > 0 &&
    totalPaid >= totalCharged
  ) {
    return "paid";
  }

  if (totalPaid > 0) {
    return "partial";
  }

  return "pending";
}

function calculatePercentage(
  value: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(
    Math.round(
      (value / total) * 1000,
    ) / 10,
    100,
  );
}

function consolidateParticipants(
  summary: TripFinancialSummary | null,
): TripParticipantFinancialSummary[] {
  if (!summary) {
    return [];
  }

  const participantsMap = new Map<
    number,
    TripParticipantFinancialSummary
  >();

  summary.members.forEach((charge) => {
    const currentParticipant =
      participantsMap.get(
        charge.memberId,
      );

    if (!currentParticipant) {
      participantsMap.set(
        charge.memberId,
        {
          memberId: charge.memberId,
          memberName: charge.memberName,
          chargeCount: 1,
          totalCharged:
            charge.totalCharged,
          totalPaid:
            charge.totalPaid,
          totalPending:
            charge.totalPending,
          status: charge.status,
        },
      );

      return;
    }

    currentParticipant.chargeCount += 1;

    currentParticipant.totalCharged +=
      charge.totalCharged;

    currentParticipant.totalPaid +=
      charge.totalPaid;

    currentParticipant.totalPending +=
      charge.totalPending;

    currentParticipant.status =
      getFinancialStatus(
        currentParticipant.totalCharged,
        currentParticipant.totalPaid,
      );
  });

  return Array.from(
    participantsMap.values(),
  ).sort((firstParticipant, secondParticipant) =>
    firstParticipant.memberName.localeCompare(
      secondParticipant.memberName,
      "es",
    ),
  );
}

export function useTripFinancialDashboard(
  tripId: string,
): UseTripFinancialDashboardResult {
  const [
    summary,
    setSummary,
  ] = useState<TripFinancialSummary | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const refreshFinancialDashboard =
    useCallback(async (): Promise<void> => {
      const requestId =
        requestIdRef.current + 1;

      requestIdRef.current = requestId;

      setLoading(true);
      setError(null);

      try {
        const financialSummary =
          await getTripFinancialSummary(
            tripId,
          );

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setSummary(financialSummary);
      } catch (loadError) {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setSummary(null);
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
    void refreshFinancialDashboard();

    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshFinancialDashboard]);

  const participants = useMemo(
    () =>
      consolidateParticipants(summary),
    [summary],
  );

  const metrics = useMemo<
    TripFinancialDashboardMetrics
  >(() => {
    const paidParticipantCount =
      participants.filter(
        (participant) =>
          participant.status === "paid",
      ).length;

    const partialParticipantCount =
      participants.filter(
        (participant) =>
          participant.status === "partial",
      ).length;

    const pendingParticipantCount =
      participants.filter(
        (participant) =>
          participant.status === "pending",
      ).length;

    return {
      participantCount:
        participants.length,

      chargeCount:
        summary?.members.length ?? 0,

      paidParticipantCount,

      partialParticipantCount,

      pendingParticipantCount,

      budgetCoveragePercentage:
        calculatePercentage(
          summary?.totalPaid ?? 0,
          summary?.estimatedBudget ?? 0,
        ),
    };
  }, [participants, summary]);

  return {
    summary,
    participants,
    metrics,
    loading,
    error,
    refreshFinancialDashboard,
  };
}