import Button from "@/components/common/Button";

import type { Member } from "@/types/member";

import type {
  TripMemberRole,
  TripParticipationStatus,
} from "@/types/tripMember";

interface AddTripMemberFormProps {
  availableMembers: Member[];
  selectedMemberId: string;
  selectedRole: TripMemberRole;
  selectedParticipationStatus:
    TripParticipationStatus;
  isLoading: boolean;
  isSaving: boolean;
  onMemberChange: (memberId: string) => void;
  onRoleChange: (
    role: TripMemberRole,
  ) => void;
  onParticipationStatusChange: (
    status: TripParticipationStatus,
  ) => void;
  onAdd: () => void;
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

export default function AddTripMemberForm({
  availableMembers,
  selectedMemberId,
  selectedRole,
  selectedParticipationStatus,
  isLoading,
  isSaving,
  onMemberChange,
  onRoleChange,
  onParticipationStatusChange,
  onAdd,
}: AddTripMemberFormProps) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
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
              onMemberChange(
                event.target.value,
              )
            }
            disabled={
              isLoading ||
              isSaving ||
              availableMembers.length === 0
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {availableMembers.length > 0
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
              onRoleChange(
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
              onParticipationStatusChange(
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
          onClick={onAdd}
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
  );
}