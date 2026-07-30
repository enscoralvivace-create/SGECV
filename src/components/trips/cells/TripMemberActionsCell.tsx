"use client";

import type {
  TripMemberListItem,
} from "@/types/tripMember";

interface TripMemberActionsCellProps {
  tripMember: TripMemberListItem;
  isProcessing: boolean;
  isAnyProcessing: boolean;
  onRemove: (
    tripMember: TripMemberListItem,
  ) => void;
}

export default function TripMemberActionsCell({
  tripMember,
  isProcessing,
  isAnyProcessing,
  onRemove,
}: TripMemberActionsCellProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onRemove(tripMember);
      }}
      disabled={
        isProcessing ||
        isAnyProcessing
      }
      className="font-semibold text-rose-700 transition hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isProcessing
        ? "Procesando..."
        : "Quitar"}
    </button>
  );
}