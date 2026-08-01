"use client";

import type {
  TripMemberFinancialStatus,
} from "@/types/tripFinancial";

interface FinancialOverview {
  memberId: number;
  hasCharge: boolean;
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  status: TripMemberFinancialStatus;
}

interface TripMemberFinancialCellProps {
  financial: FinancialOverview | undefined;
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    },
  ).format(value);
}

export default function TripMemberFinancialCell({
  financial,
}: TripMemberFinancialCellProps) {
  if (!financial) {
    return (
      <div>
        <p className="font-semibold text-slate-400">
          —
        </p>

        <span className="mt-1 block text-xs text-slate-400">
          Sin cargo
        </span>
      </div>
    );
  }

  return (
    <div>
      <p className="font-bold text-slate-900">
        {formatCurrency(
          financial.totalCharged,
        )}
      </p>

      <span className="mt-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
        Cargo generado
      </span>
    </div>
  );
}