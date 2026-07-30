"use client";

import {
  Search,
  UserPlus,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import Button from "@/components/common/Button";

import type {
  Member,
} from "@/types/member";

import type {
  TripParticipantStatus,
} from "@/types/tripParticipant";

interface AddTripParticipantModalProps {
  members: Member[];
  existingMemberIds: number[];
  loading: boolean;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onAdd: (
    memberId: number,
    status: TripParticipantStatus,
  ) => void;
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
];

function getFullName(
  member: Member,
): string {
  return [
    member.name,
    member.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function AddTripParticipantModal({
  members,
  existingMemberIds,
  loading,
  isSaving,
  error,
  onClose,
  onAdd,
}: AddTripParticipantModalProps) {
  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] = useState<number | null>(null);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<TripParticipantStatus>(
    "pending",
  );

  const availableMembers =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLocaleLowerCase("es-MX");

      return members
        .filter(
          (member) =>
            member.status === "Activo",
        )
        .filter(
          (member) =>
            !existingMemberIds.includes(
              member.id,
            ),
        )
        .filter((member) => {
          if (!normalizedSearch) {
            return true;
          }

          const searchableText = [
            member.name,
            member.last_name,
            member.voice,
            member.email ?? "",
          ]
            .join(" ")
            .toLocaleLowerCase("es-MX");

          return searchableText.includes(
            normalizedSearch,
          );
        })
        .sort((first, second) => {
          const firstName =
            `${first.last_name} ${first.name}`;

          const secondName =
            `${second.last_name} ${second.name}`;

          return firstName.localeCompare(
            secondName,
            "es-MX",
          );
        });
    }, [
      existingMemberIds,
      members,
      searchTerm,
    ]);

  function handleSubmit(): void {
    if (
      selectedMemberId === null ||
      isSaving
    ) {
      return;
    }

    onAdd(
      selectedMemberId,
      selectedStatus,
    );
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-slate-950/60
        px-4 py-8
      "
    >
      <div
        className="
          flex max-h-full w-full
          max-w-2xl flex-col
          overflow-hidden rounded-2xl
          bg-white shadow-2xl
        "
      >
        <div
          className="
            flex items-start
            justify-between gap-4
            border-b border-slate-200
            px-6 py-5
          "
        >
          <div>
            <h2
              className="
                text-xl font-bold
                text-slate-950
              "
            >
              Agregar participante
            </h2>

            <p
              className="
                mt-1 text-sm
                text-slate-600
              "
            >
              Selecciona un integrante activo
              para incorporarlo al viaje.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar"
            className="
              rounded-lg p-2
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X
              aria-hidden="true"
              className="h-5 w-5"
            />
          </button>
        </div>

        <div
          className="
            space-y-5 overflow-y-auto
            px-6 py-6
          "
        >
          <label className="block">
            <span
              className="
                mb-2 block text-sm
                font-semibold text-slate-700
              "
            >
              Buscar integrante
            </span>

            <div className="relative">
              <Search
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute left-3 top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(
                    event.target.value,
                  );
                }}
                placeholder="Nombre, apellido, voz o correo"
                disabled={
                  loading || isSaving
                }
                className="
                  w-full rounded-lg
                  border border-slate-300
                  py-3 pl-10 pr-4
                  text-slate-900
                  outline-none transition
                  focus:border-emerald-700
                  focus:ring-2
                  focus:ring-emerald-100
                  disabled:cursor-not-allowed
                  disabled:bg-slate-100
                "
              />
            </div>
          </label>

          <div>
            <span
              className="
                mb-2 block text-sm
                font-semibold text-slate-700
              "
            >
              Integrante
            </span>

            <div
              className="
                max-h-72 overflow-y-auto
                rounded-xl border
                border-slate-200
              "
            >
              {loading ? (
                <div
                  className="
                    px-5 py-10 text-center
                    text-sm text-slate-500
                  "
                >
                  Cargando integrantes...
                </div>
              ) : availableMembers.length === 0 ? (
                <div
                  className="
                    px-5 py-10 text-center
                  "
                >
                  <UserPlus
                    aria-hidden="true"
                    className="
                      mx-auto h-7 w-7
                      text-slate-400
                    "
                  />

                  <p
                    className="
                      mt-3 font-semibold
                      text-slate-800
                    "
                  >
                    No hay integrantes disponibles
                  </p>

                  <p
                    className="
                      mt-1 text-sm
                      text-slate-500
                    "
                  >
                    Todos los integrantes activos
                    ya están registrados o no hay
                    coincidencias con la búsqueda.
                  </p>
                </div>
              ) : (
                <div
                  className="
                    divide-y
                    divide-slate-100
                  "
                >
                  {availableMembers.map(
                    (member) => {
                      const isSelected =
                        selectedMemberId ===
                        member.id;

                      return (
                        <label
                          key={member.id}
                          className={`
                            flex cursor-pointer
                            items-center gap-3
                            px-4 py-3
                            transition-colors
                            ${
                              isSelected
                                ? "bg-emerald-50"
                                : "hover:bg-slate-50"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="trip-member"
                            value={member.id}
                            checked={isSelected}
                            disabled={isSaving}
                            onChange={() => {
                              setSelectedMemberId(
                                member.id,
                              );
                            }}
                            className="
                              h-4 w-4
                              accent-emerald-700
                            "
                          />

                          <div
                            className="
                              min-w-0 flex-1
                            "
                          >
                            <p
                              className="
                                truncate
                                font-semibold
                                text-slate-900
                              "
                            >
                              {getFullName(member)}
                            </p>

                            <p
                              className="
                                mt-0.5 truncate
                                text-sm
                                text-slate-500
                              "
                            >
                              {member.voice}

                              {member.email
                                ? ` · ${member.email}`
                                : ""}
                            </p>
                          </div>
                        </label>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>

          <label className="block">
            <span
              className="
                mb-2 block text-sm
                font-semibold text-slate-700
              "
            >
              Estado inicial
            </span>

            <select
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(
                  event.target
                    .value as TripParticipantStatus,
                );
              }}
              disabled={isSaving}
              className="
                w-full rounded-lg
                border border-slate-300
                bg-white px-4 py-3
                text-slate-900
                outline-none transition
                focus:border-emerald-700
                focus:ring-2
                focus:ring-emerald-100
                disabled:cursor-not-allowed
                disabled:bg-slate-100
              "
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
          </label>

          {error ? (
            <div
              role="alert"
              className="
                rounded-xl border
                border-red-200 bg-red-50
                px-4 py-3
                text-sm text-red-900
              "
            >
              {error}
            </div>
          ) : null}
        </div>

        <div
          className="
            flex flex-col-reverse gap-3
            border-t border-slate-200
            px-6 py-5
            sm:flex-row
            sm:justify-end
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="
              rounded-lg border
              border-slate-300
              px-5 py-3
              font-semibold
              text-slate-700
              transition-colors
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancelar
          </button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              selectedMemberId === null ||
              loading ||
              isSaving
            }
          >
            {isSaving
              ? "Agregando..."
              : "Agregar participante"}
          </Button>
        </div>
      </div>
    </div>
  );
}