import StatusBadge from "@/components/common/StatusBadge";
import TripMemberFinancialCell from "@/components/trips/cells/TripMemberFinancialCell";
import TripMemberPaymentCell from "@/components/trips/cells/TripMemberPaymentCell";
import TripMemberActionsCell from "@/components/trips/cells/TripMemberActionsCell";

import type {
  TripMemberListItem,
  TripMemberRole,
  TripParticipationStatus,
} from "@/types/tripMember";

import type {
  TripMemberFinancialStatus,
} from "@/types/tripFinancial";

export interface TripMemberFinancialOverview {
  memberId: number;
  hasCharge: boolean;
  totalCharged: number;
  totalPaid: number;
  totalPending: number;
  status: TripMemberFinancialStatus;
}

interface TripMembersTableProps {
  tripMembers: TripMemberListItem[];
  financialByMemberId: Map<
    number,
    TripMemberFinancialOverview
  >;
  isLoading: boolean;
  processingId: string | null;
  onRoleChange: (
    tripMember: TripMemberListItem,
    role: TripMemberRole,
  ) => void;
  onStatusChange: (
    tripMember: TripMemberListItem,
    participationStatus:
      TripParticipationStatus,
  ) => void;
  onRemove: (
    tripMember: TripMemberListItem,
  ) => void;
}

const roleOptions: Array<{
  value: TripMemberRole;
  label: string;
}> = [
  {
    value: "participant",
    label: "Participante",
  },
  {
    value: "staff",
    label: "Staff",
  },
  {
    value: "director",
    label: "Director",
  },
];

const participationStatusOptions: Array<{
  value: TripParticipationStatus;
  label: string;
}> = [
  {
    value: "invited",
    label: "Invitado",
  },
  {
    value: "confirmed",
    label: "Confirmado",
  },
  {
    value: "cancelled",
    label: "Cancelado",
  },
];

function getRoleLabel(
  role: TripMemberRole,
): string {
  const labels: Record<
    TripMemberRole,
    string
  > = {
    participant: "Participante",
    staff: "Staff",
    director: "Director",
  };

  return labels[role];
}

function getParticipationStatusLabel(
  status: TripParticipationStatus,
): string {
  const labels: Record<
    TripParticipationStatus,
    string
  > = {
    invited: "Invitado",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
  };

  return labels[status];
}

export default function TripMembersTable({
  tripMembers,
  financialByMemberId,
  isLoading,
  processingId,
  onRoleChange,
  onStatusChange,
  onRemove,
}: TripMembersTableProps) {
  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Lista de participantes
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {tripMembers.length}{" "}
            {tripMembers.length === 1
              ? "persona registrada"
              : "personas registradas"}
            .
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        {isLoading ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-800" />

            <p className="mt-4 font-medium text-slate-600">
              Cargando participantes...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[1200px] text-left">
              <thead className="bg-slate-50 text-sm uppercase text-slate-600">
                <tr>
                  <th className="px-5 py-4">
                    Integrante
                  </th>

                  <th className="px-5 py-4">
                    Rol
                  </th>

                  <th className="px-5 py-4">
                    Participación
                  </th>

                  <th className="px-5 py-4">
                    Cargo
                  </th>

                  <th className="px-5 py-4">
                    Pago
                  </th>

                  <th className="px-5 py-4">
                    Estado
                  </th>

                  <th className="px-5 py-4">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {tripMembers.map(
                  (tripMember) => {
                    const isProcessing =
                      processingId ===
                      tripMember.id;

                    const financial =
                      financialByMemberId.get(
                        tripMember.memberId,
                      );

                    return (
                      <tr
                        key={tripMember.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {
                              tripMember.memberName
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {tripMember.memberVoice ??
                              "Sin voz o función registrada"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={
                              tripMember.role
                            }
                            onChange={(
                              event,
                            ) => {
                              onRoleChange(
                                tripMember,
                                event.target
                                  .value as TripMemberRole,
                              );
                            }}
                            disabled={
                              isProcessing ||
                              processingId !==
                                null
                            }
                            aria-label={`Rol de ${tripMember.memberName}`}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            {roleOptions.map(
                              (option) => (
                                <option
                                  key={
                                    option.value
                                  }
                                  value={
                                    option.value
                                  }
                                >
                                  {
                                    option.label
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={
                              tripMember.participationStatus
                            }
                            onChange={(
                              event,
                            ) => {
                              onStatusChange(
                                tripMember,
                                event.target
                                  .value as TripParticipationStatus,
                              );
                            }}
                            disabled={
                              isProcessing ||
                              processingId !==
                                null
                            }
                            aria-label={`Estado de participación de ${tripMember.memberName}`}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            {participationStatusOptions.map(
                              (option) => (
                                <option
                                  key={
                                    option.value
                                  }
                                  value={
                                    option.value
                                  }
                                >
                                  {
                                    option.label
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <TripMemberFinancialCell
                            financial={financial}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <TripMemberPaymentCell
                            financial={financial}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <StatusBadge
                              status={getParticipationStatusLabel(
                                tripMember.participationStatus,
                              )}
                              className="text-sm"
                            />

                            <span className="text-xs font-medium text-slate-500">
                              {getRoleLabel(
                                tripMember.role,
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <TripMemberActionsCell
                            tripMember={tripMember}
                            isProcessing={
                              isProcessing
                            }
                            isAnyProcessing={
                              processingId !== null
                            }
                            onRemove={onRemove}
                          />
                        </td>
                      </tr>
                    );
                  },
                )}

                {tripMembers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-14 text-center text-slate-500"
                    >
                      Todavía no hay
                      participantes registrados
                      en este viaje.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}