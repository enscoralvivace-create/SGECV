"use client";

import {
  RefreshCw,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-react";

import type {
  TripParticipant,
  TripParticipantStatus,
} from "@/types/tripParticipant";

import {
  tripParticipantStatusLabels,
} from "@/types/tripParticipant";

interface TripParticipantsCardProps {
  participants: TripParticipant[];
  loading: boolean;
  error: string | null;
  onAddParticipant?: () => void;
  onRetry?: () => void;
  onChangeStatus?: (
    participantId: string,
    status: TripParticipantStatus,
  ) => void;
  onRemoveParticipant?: (
    participant: TripParticipant,
  ) => void;
  updatingParticipantId?: string | null;
}

const statusOptions: Array<{
  value: TripParticipantStatus;
  label: string;
}> = [
  {
    value: "pending",
    label: "Pendiente",
  },
  {
    value: "confirmed",
    label: "Confirmado",
  },
  {
    value: "declined",
    label: "No participará",
  },
  {
    value: "cancelled",
    label: "Cancelado",
  },
];

function getStatusClasses(
  status: TripParticipantStatus,
): string {
  switch (status) {
    case "confirmed":
      return `
        border-emerald-200
        bg-emerald-50
        text-emerald-800
      `;

    case "declined":
      return `
        border-red-200
        bg-red-50
        text-red-800
      `;

    case "cancelled":
      return `
        border-slate-300
        bg-slate-100
        text-slate-700
      `;

    case "pending":
    default:
      return `
        border-amber-200
        bg-amber-50
        text-amber-800
      `;
  }
}

function getParticipantFullName(
  participant: TripParticipant,
): string {
  return [
    participant.memberName,
    participant.memberLastName,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function TripParticipantsCard({
  participants,
  loading,
  error,
  onAddParticipant,
  onRetry,
  onChangeStatus,
  onRemoveParticipant,
  updatingParticipantId = null,
}: TripParticipantsCardProps) {
  return (
    <section
      className="
        overflow-hidden rounded-2xl
        border border-slate-200
        bg-white shadow-sm
      "
    >
      <div
        className="
          flex flex-col gap-4
          border-b border-slate-200
          px-5 py-5
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex h-11 w-11
              shrink-0 items-center
              justify-center rounded-xl
              bg-emerald-50
              text-emerald-700
            "
          >
            <Users
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div>
            <h2
              className="
                text-lg font-bold
                text-slate-950
              "
            >
              Participantes del viaje
            </h2>

            <p
              className="
                mt-1 text-sm
                text-slate-600
              "
            >
              {participants.length === 1
                ? "1 integrante registrado."
                : `${participants.length} integrantes registrados.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddParticipant}
          disabled={!onAddParticipant}
          className="
            inline-flex items-center
            justify-center gap-2
            rounded-lg bg-emerald-700
            px-4 py-2.5
            text-sm font-semibold
            text-white transition-colors
            hover:bg-emerald-800
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500
            focus:ring-offset-2
            disabled:cursor-not-allowed
            disabled:bg-slate-300
          "
        >
          <UserPlus
            aria-hidden="true"
            className="h-4 w-4"
          />

          Agregar participante
        </button>
      </div>

      {loading ? (
        <div
          className="
            flex min-h-48 items-center
            justify-center px-6 py-10
          "
        >
          <div
            className="
              flex flex-col items-center
              gap-3 text-center
            "
          >
            <RefreshCw
              aria-hidden="true"
              className="
                h-6 w-6 animate-spin
                text-slate-500
              "
            />

            <p
              className="
                text-sm font-medium
                text-slate-600
              "
            >
              Cargando participantes...
            </p>
          </div>
        </div>
      ) : error ? (
        <div
          className="
            flex min-h-48 items-center
            justify-center px-6 py-10
          "
        >
          <div
            className="
              max-w-md text-center
            "
          >
            <div
              className="
                mx-auto flex h-11 w-11
                items-center justify-center
                rounded-full bg-red-100
              "
            >
              <TriangleAlert
                aria-hidden="true"
                className="
                  h-5 w-5 text-red-700
                "
              />
            </div>

            <p
              className="
                mt-3 font-semibold
                text-red-950
              "
            >
              No fue posible cargar los participantes
            </p>

            <p
              className="
                mt-1 text-sm
                leading-6 text-red-800
              "
            >
              {error}
            </p>

            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="
                  mt-4 inline-flex
                  items-center gap-2
                  rounded-lg border
                  border-red-300
                  bg-white px-4 py-2
                  text-sm font-semibold
                  text-red-800
                  transition-colors
                  hover:bg-red-50
                "
              >
                <RefreshCw
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Intentar nuevamente
              </button>
            ) : null}
          </div>
        </div>
      ) : participants.length === 0 ? (
        <div
          className="
            flex min-h-52 items-center
            justify-center px-6 py-10
          "
        >
          <div
            className="
              max-w-md text-center
            "
          >
            <div
              className="
                mx-auto flex h-12 w-12
                items-center justify-center
                rounded-full bg-slate-100
              "
            >
              <Users
                aria-hidden="true"
                className="
                  h-6 w-6 text-slate-500
                "
              />
            </div>

            <h3
              className="
                mt-4 font-semibold
                text-slate-900
              "
            >
              Aún no hay participantes
            </h3>

            <p
              className="
                mt-2 text-sm leading-6
                text-slate-600
              "
            >
              Agrega integrantes para controlar su
              participación, cargos y pagos relacionados
              con este viaje.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="
              min-w-full
              divide-y divide-slate-200
            "
          >
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="
                    px-5 py-3 text-left
                    text-xs font-bold
                    uppercase tracking-wide
                    text-slate-600
                    sm:px-6
                  "
                >
                  Integrante
                </th>

                <th
                  scope="col"
                  className="
                    px-5 py-3 text-left
                    text-xs font-bold
                    uppercase tracking-wide
                    text-slate-600
                  "
                >
                  Voz
                </th>

                <th
                  scope="col"
                  className="
                    px-5 py-3 text-left
                    text-xs font-bold
                    uppercase tracking-wide
                    text-slate-600
                  "
                >
                  Estado
                </th>

                <th
                  scope="col"
                  className="
                    px-5 py-3 text-right
                    text-xs font-bold
                    uppercase tracking-wide
                    text-slate-600
                    sm:px-6
                  "
                >
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody
              className="
                divide-y divide-slate-100
                bg-white
              "
            >
              {participants.map(
                (participant) => {
                  const isUpdating =
                    updatingParticipantId ===
                    participant.id;

                  return (
                    <tr
                      key={participant.id}
                      className="
                        transition-colors
                        hover:bg-slate-50
                      "
                    >
                      <td
                        className="
                          whitespace-nowrap
                          px-5 py-4 sm:px-6
                        "
                      >
                        <p
                          className="
                            font-semibold
                            text-slate-900
                          "
                        >
                          {getParticipantFullName(
                            participant,
                          )}
                        </p>

                        {participant.notes ? (
                          <p
                            className="
                              mt-1 max-w-sm
                              truncate text-xs
                              text-slate-500
                            "
                            title={
                              participant.notes
                            }
                          >
                            {participant.notes}
                          </p>
                        ) : null}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5 py-4
                          text-sm text-slate-600
                        "
                      >
                        {participant.memberVoice ??
                          "Sin asignar"}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5 py-4
                        "
                      >
                        {onChangeStatus ? (
                          <select
                            value={
                              participant.status
                            }
                            disabled={isUpdating}
                            onChange={(event) => {
                              onChangeStatus(
                                participant.id,
                                event.target
                                  .value as TripParticipantStatus,
                              );
                            }}
                            className={`
                              rounded-lg border
                              px-3 py-2
                              text-sm font-semibold
                              outline-none transition
                              focus:ring-2
                              focus:ring-emerald-200
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                              ${getStatusClasses(
                                participant.status,
                              )}
                            `}
                          >
                            {statusOptions.map(
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
                        ) : (
                          <span
                            className={`
                              inline-flex
                              rounded-full border
                              px-3 py-1
                              text-xs font-semibold
                              ${getStatusClasses(
                                participant.status,
                              )}
                            `}
                          >
                            {
                              tripParticipantStatusLabels[
                                participant.status
                              ]
                            }
                          </span>
                        )}
                      </td>

                      <td
                        className="
                          whitespace-nowrap
                          px-5 py-4 text-right
                          sm:px-6
                        "
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveParticipant?.(
                              participant,
                            );
                          }}
                          disabled={
                            !onRemoveParticipant ||
                            isUpdating
                          }
                          className="
                            rounded-lg px-3 py-2
                            text-sm font-semibold
                            text-red-700
                            transition-colors
                            hover:bg-red-50
                            disabled:cursor-not-allowed
                            disabled:text-slate-400
                            disabled:hover:bg-transparent
                          "
                        >
                          Quitar
                        </button>
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