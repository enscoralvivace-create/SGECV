"use client";

import { useMemo } from "react";

import type {
  TripFinancialSummary,
  TripMemberFinancialStatus,
} from "@/types/tripFinancial";

import type { Member } from "@/types/member";
import type {
  TripMemberListItem,
} from "@/types/tripMember";

export interface TripMemberFinancialOverview {
  memberId: number;
  hasCharge: boolean;
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  status: TripMemberFinancialStatus;
}

interface ParticipantIndicators {
  total: number;
  confirmed: number;
  invited: number;
  cancelled: number;
  charged: number;
  paid: number;
  partial: number;
  pending: number;
}

interface UseTripMemberSummaryParams {
  members: Member[];
  tripMembers: TripMemberListItem[];
  financialSummary:
    | TripFinancialSummary
    | null;
}

interface UseTripMemberSummaryResult {
  availableMembers: Member[];
  financialByMemberId: Map<
    number,
    TripMemberFinancialOverview
  >;
  participantIndicators:
    ParticipantIndicators;
  sortedTripMembers:
    TripMemberListItem[];
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

export default function useTripMemberSummary({
  members,
  tripMembers,
  financialSummary,
}: UseTripMemberSummaryParams): UseTripMemberSummaryResult {
  const activeMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.status.toLowerCase() ===
          "activo",
      ),
    [members],
  );

  const availableMembers = useMemo(() => {
    const registeredMemberIds =
      new Set(
        tripMembers.map(
          (tripMember) =>
            tripMember.memberId,
        ),
      );

    return activeMembers.filter(
      (member) =>
        !registeredMemberIds.has(
          member.id,
        ),
    );
  }, [activeMembers, tripMembers]);

  const financialByMemberId =
    useMemo(() => {
      const financialMap =
        new Map<
          number,
          TripMemberFinancialOverview
        >();

      for (const financialMember of
        financialSummary?.members ?? []) {
        const current =
          financialMap.get(
            financialMember.memberId,
          );

        const totalCharged =
          (current?.totalCharged ?? 0) +
          financialMember.totalCharged;

        const totalPaid =
          (current?.totalPaid ?? 0) +
          financialMember.totalPaid;

        const totalPending = Math.max(
          totalCharged - totalPaid,
          0,
        );

        financialMap.set(
          financialMember.memberId,
          {
            memberId:
              financialMember.memberId,
            hasCharge: true,
            totalCharged,
            totalPaid,
            totalPending,
            status:
              getFinancialStatus(
                totalCharged,
                totalPaid,
              ),
          },
        );
      }

      return financialMap;
    }, [financialSummary]);

  const participantIndicators =
    useMemo(() => {
      const confirmedCount =
        tripMembers.filter(
          (tripMember) =>
            tripMember.participationStatus ===
            "confirmed",
        ).length;

      const invitedCount =
        tripMembers.filter(
          (tripMember) =>
            tripMember.participationStatus ===
            "invited",
        ).length;

      const cancelledCount =
        tripMembers.filter(
          (tripMember) =>
            tripMember.participationStatus ===
            "cancelled",
        ).length;

      const financialMembers = [
        ...financialByMemberId.values(),
      ];

      const chargedCount =
        financialMembers.length;

      const paidCount =
        financialMembers.filter(
          (member) =>
            member.status === "paid",
        ).length;

      const partialCount =
        financialMembers.filter(
          (member) =>
            member.status === "partial",
        ).length;

      const pendingCount =
        financialMembers.filter(
          (member) =>
            member.status === "pending",
        ).length;

      return {
        total: tripMembers.length,
        confirmed: confirmedCount,
        invited: invitedCount,
        cancelled: cancelledCount,
        charged: chargedCount,
        paid: paidCount,
        partial: partialCount,
        pending: pendingCount,
      };
    }, [
      financialByMemberId,
      tripMembers,
    ]);

  const sortedTripMembers =
    useMemo(() => {
      const financialPriority: Record<
        TripMemberFinancialStatus,
        number
      > = {
        pending: 0,
        partial: 1,
        paid: 2,
      };

      return [...tripMembers].sort(
        (
          firstMember,
          secondMember,
        ) => {
          const firstFinancial =
            financialByMemberId.get(
              firstMember.memberId,
            );

          const secondFinancial =
            financialByMemberId.get(
              secondMember.memberId,
            );

          const firstPriority =
            firstFinancial
              ? financialPriority[
                  firstFinancial.status
                ]
              : 3;

          const secondPriority =
            secondFinancial
              ? financialPriority[
                  secondFinancial.status
                ]
              : 3;

          if (
            firstPriority !==
            secondPriority
          ) {
            return (
              firstPriority -
              secondPriority
            );
          }

          return firstMember.memberName.localeCompare(
            secondMember.memberName,
            "es",
            {
              sensitivity: "base",
            },
          );
        },
      );
    }, [
      financialByMemberId,
      tripMembers,
    ]);

  return {
    availableMembers,
    financialByMemberId,
    participantIndicators,
    sortedTripMembers,
  };
}