import type {
  TripMemberFinancialStatus,
  TripParticipantFinancialSummary,
} from "@/types/tripFinancial";

interface TripMemberFinancialTableProps {
  participants:
    TripParticipantFinancialSummary[];
}

interface FinancialStatusConfig {
  label: string;
  classes: string;
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

function getStatusConfig(
  status: TripMemberFinancialStatus,
): FinancialStatusConfig {
  switch (status) {
    case "paid":
      return {
        label: "Al corriente",
        classes:
          "bg-emerald-100 text-emerald-700",
      };

    case "partial":
      return {
        label: "Pago parcial",
        classes:
          "bg-amber-100 text-amber-700",
      };

    case "pending":
      return {
        label: "Pendiente",
        classes:
          "bg-rose-100 text-rose-700",
      };
  }
}

function getChargeCountLabel(
  chargeCount: number,
): string {
  return chargeCount === 1
    ? "1 cargo"
    : `${chargeCount} cargos`;
}

export default function TripMemberFinancialTable({
  participants,
}: TripMemberFinancialTableProps) {
  return (
    <section
      aria-labelledby="trip-member-financial-title"
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      <div
        className="
          border-b
          border-slate-200
          px-5
          py-4
        "
      >
        <h3
          id="trip-member-financial-title"
          className="
            text-lg
            font-semibold
            text-slate-900
          "
        >
          Estado financiero por participante
        </h3>

        <p
          className="
            mt-1
            text-sm
            leading-5
            text-slate-500
          "
        >
          Los importes se consolidan por
          integrante, aunque tenga varios
          cargos asociados al viaje.
        </p>
      </div>

      {participants.length === 0 ? (
        <div
          className="
            px-5
            py-10
            text-center
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-slate-700
            "
          >
            No hay información financiera
            para mostrar.
          </p>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Los participantes aparecerán
            cuando tengan cargos asociados
            a este viaje.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto overscroll-x-contain">
          <table
            className="
              min-w-full
              divide-y
              divide-slate-200
            "
          >
            <thead className="bg-slate-50">
              <tr>
                <th
                  className="
                    px-5
                    py-3
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                  scope="col"
                >
                  Participante
                </th>

                <th
                  className="
                    px-5
                    py-3
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                  scope="col"
                >
                  Cargos
                </th>

                <th
                  className="
                    px-5
                    py-3
                    text-right
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                  scope="col"
                >
                  Total asignado
                </th>

                <th
                  className="
                    px-5
                    py-3
                    text-right
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                  scope="col"
                >
                  Pagado
                </th>

                <th
                  className="
                    px-5
                    py-3
                    text-right
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                  scope="col"
                >
                  Pendiente
                </th>

                <th
                  className="
                    px-5
                    py-3
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                  scope="col"
                >
                  Estado
                </th>
              </tr>
            </thead>

            <tbody
              className="
                divide-y
                divide-slate-100
                bg-white
              "
            >
              {participants.map(
                (participant) => {
                  const statusConfig =
                    getStatusConfig(
                      participant.status,
                    );

                  return (
                    <tr
                      key={participant.memberId}
                      className="
                        transition-colors
                        hover:bg-slate-50
                      "
                    >
                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                        "
                      >
                        <p
                          className="
                            text-sm
                            font-medium
                            text-slate-900
                          "
                        >
                          {
                            participant.memberName
                          }
                        </p>
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-sm
                          text-slate-600
                        "
                      >
                        {getChargeCountLabel(
                          participant.chargeCount,
                        )}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-right
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {formatCurrency(
                          participant.totalCharged,
                        )}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-right
                          text-sm
                          font-medium
                          text-emerald-700
                        "
                      >
                        {formatCurrency(
                          participant.totalPaid,
                        )}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-right
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {formatCurrency(
                          participant.totalPending,
                        )}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                        "
                      >
                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            ${statusConfig.classes}
                          `}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}