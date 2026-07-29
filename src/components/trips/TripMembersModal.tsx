"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";

import { getMembers } from "@/services/memberService";

import {
  addTripMember,
  getTripMembers,
  removeTripMember,
  updateTripMember,
} from "@/services/tripMemberService";

import type { Member } from "@/types/member";
import type { Trip } from "@/types/trip";

import type {
  TripMemberListItem,
  TripMemberRole,
  TripParticipationStatus,
} from "@/types/tripMember";

interface TripMembersModalProps {
  trip: Trip;
  onClose: () => void;
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

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

function getMemberFullName(
  member: Member,
): string {
  return [
    member.name,
    member.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function TripMembersModal({
  trip,
  onClose,
}: TripMembersModalProps) {
  const [members, setMembers] =
    useState<Member[]>([]);

  const [tripMembers, setTripMembers] =
    useState<TripMemberListItem[]>([]);

  const [selectedMemberId, setSelectedMemberId] =
    useState("");

  const [selectedRole, setSelectedRole] =
    useState<TripMemberRole>(
      "participant",
    );

  const [
    selectedParticipationStatus,
    setSelectedParticipationStatus,
  ] =
    useState<TripParticipationStatus>(
      "confirmed",
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const loadData = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setMessage("");

        const [
          membersData,
          tripMembersData,
        ] = await Promise.all([
          getMembers(),
          getTripMembers(trip.id),
        ]);

        setMembers(membersData);
        setTripMembers(tripMembersData);
      } catch (error: unknown) {
        console.error(error);

        setMessage(
          `No fue posible cargar los participantes: ${getErrorMessage(
            error,
            "Error desconocido.",
          )}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [trip.id],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

  async function handleAddMember() {
    if (!selectedMemberId) {
      setMessage(
        "Selecciona un integrante.",
      );

      return;
    }

    const memberId =
      Number(selectedMemberId);

    if (
      !Number.isInteger(memberId) ||
      memberId <= 0
    ) {
      setMessage(
        "El integrante seleccionado no es válido.",
      );

      return;
    }

    try {
      setIsSaving(true);
      setMessage("");

      await addTripMember({
        tripId: trip.id,
        memberId,
        role: selectedRole,
        participationStatus:
          selectedParticipationStatus,
      });

      await loadData();

      setSelectedMemberId("");
      setSelectedRole("participant");
      setSelectedParticipationStatus(
        "confirmed",
      );

      setMessage(
        "Participante agregado correctamente.",
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        `No fue posible agregar al participante: ${getErrorMessage(
          error,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRoleChange(
    tripMember: TripMemberListItem,
    role: TripMemberRole,
  ) {
    try {
      setProcessingId(tripMember.id);
      setMessage("");

      await updateTripMember(
        tripMember.id,
        role,
        tripMember.participationStatus,
      );

      setTripMembers(
        (currentTripMembers) =>
          currentTripMembers.map(
            (currentTripMember) =>
              currentTripMember.id ===
              tripMember.id
                ? {
                    ...currentTripMember,
                    role,
                  }
                : currentTripMember,
          ),
      );

      setMessage(
        "Rol actualizado correctamente.",
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        `No fue posible actualizar el rol: ${getErrorMessage(
          error,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleStatusChange(
    tripMember: TripMemberListItem,
    participationStatus:
      TripParticipationStatus,
  ) {
    try {
      setProcessingId(tripMember.id);
      setMessage("");

      await updateTripMember(
        tripMember.id,
        tripMember.role,
        participationStatus,
      );

      setTripMembers(
        (currentTripMembers) =>
          currentTripMembers.map(
            (currentTripMember) =>
              currentTripMember.id ===
              tripMember.id
                ? {
                    ...currentTripMember,
                    participationStatus,
                  }
                : currentTripMember,
          ),
      );

      setMessage(
        "Estado de participación actualizado correctamente.",
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        `No fue posible actualizar el estado: ${getErrorMessage(
          error,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRemoveMember(
    tripMember: TripMemberListItem,
  ) {
    const confirmed = window.confirm(
      `¿Deseas quitar a ${tripMember.memberName} de este viaje?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(tripMember.id);
      setMessage("");

      await removeTripMember(
        tripMember.id,
      );

      setTripMembers(
        (currentTripMembers) =>
          currentTripMembers.filter(
            (currentTripMember) =>
              currentTripMember.id !==
              tripMember.id,
          ),
      );

      setMessage(
        "Participante eliminado correctamente.",
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        `No fue posible quitar al participante: ${getErrorMessage(
          error,
          "Error desconocido.",
        )}`,
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Participantes del viaje
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {trip.name}
              {" · "}
              {trip.destination}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              isSaving ||
              processingId !== null
            }
            aria-label="Cerrar"
            className="rounded-lg px-3 py-2 text-xl font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-900">
              Agregar participante
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Integrante
                </span>

                <select
                  value={selectedMemberId}
                  onChange={(event) =>
                    setSelectedMemberId(
                      event.target.value,
                    )
                  }
                  disabled={
                    isLoading ||
                    isSaving ||
                    availableMembers.length ===
                      0
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {availableMembers.length >
                    0
                      ? "Selecciona un integrante"
                      : "No hay integrantes disponibles"}
                  </option>

                  {availableMembers.map(
                    (member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {getMemberFullName(
                          member,
                        )}
                        {member.voice
                          ? ` · ${member.voice}`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Rol
                </span>

                <select
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(
                      event.target
                        .value as TripMemberRole,
                    )
                  }
                  disabled={isSaving}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {roleOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Estado
                </span>

                <select
                  value={
                    selectedParticipationStatus
                  }
                  onChange={(event) =>
                    setSelectedParticipationStatus(
                      event.target
                        .value as TripParticipationStatus,
                    )
                  }
                  disabled={isSaving}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {participationStatusOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  void handleAddMember();
                }}
                disabled={
                  isSaving ||
                  !selectedMemberId
                }
              >
                {isSaving
                  ? "Agregando..."
                  : "Agregar participante"}
              </Button>
            </div>
          </section>

          {message && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
              {message}
            </div>
          )}

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
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
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

                          return (
                            <tr
                              key={
                                tripMember.id
                              }
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
                                    void handleRoleChange(
                                      tripMember,
                                      event
                                        .target
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
                                    void handleStatusChange(
                                      tripMember,
                                      event
                                        .target
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
                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleRemoveMember(
                                      tripMember,
                                    );
                                  }}
                                  disabled={
                                    isProcessing ||
                                    processingId !==
                                      null
                                  }
                                  className="font-semibold text-rose-700 transition hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isProcessing
                                    ? "Procesando..."
                                    : "Quitar"}
                                </button>
                              </td>
                            </tr>
                          );
                        },
                      )}

                      {tripMembers.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={5}
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
        </div>

        <footer className="flex justify-end border-t border-slate-200 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={
              isSaving ||
              processingId !== null
            }
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}