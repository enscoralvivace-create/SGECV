"use client";

import type {
  TripMemberFinancialStatus,
} from "@/services/tripService";

interface FinancialOverview {
  memberId: number;
  hasCharge: boolean;
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  status: TripMemberFinancialStatus;
}

interface TripMemberPaymentCellProps {
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

export default function TripMemberPaymentCell({
  financial,
}: TripMemberPaymentCellProps) {
  if (!financial) {
    return (
      <div>
        <p className="font-semibold text-slate-400">
          —
        </p>

        <span className="mt-1 block text-xs text-slate-400">
          Sin información
        </span>
      </div>
    );
  }

  if (financial.status === "paid") {
    return (
      <div>
        <p className="font-bold text-emerald-700">
          {formatCurrency(
            financial.totalPaid,
          )}
        </p>

        <span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Pagado
        </span>
      </div>
    );
  }

  if (financial.status === "partial") {
    return (
      <div>
        <p className="font-bold text-amber-700">
          {formatCurrency(
            financial.totalPending,
          )}
        </p>

        <span className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          Restante · Parcial
        </span>
      </div>
    );
  }

  return (
    <div>
      <p className="font-bold text-rose-700">
        {formatCurrency(
          financial.totalPending,
        )}
      </p>

      <span className="mt-2 inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
        Pendiente
      </span>
    </div>
  );
}