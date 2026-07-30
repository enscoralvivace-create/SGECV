"use client";

import {
  Banknote,
  FilePenLine,
  ReceiptText,
  UserPlus,
} from "lucide-react";

interface TripQuickActionsProps {
  onAddParticipant?: () => void;
  onAssignCharge?: () => void;
  onRegisterPayment?: () => void;
  onEditTrip?: () => void;
}

interface QuickActionButtonProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function QuickActionButton({
  label,
  description,
  icon,
  onClick,
}: QuickActionButtonProps) {
  const isDisabled = !onClick;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className="
        group flex min-h-28
        items-start gap-4
        rounded-xl border
        border-slate-200 bg-white
        p-4 text-left
        shadow-sm
        transition
        hover:border-slate-300
        hover:shadow-md
        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:hover:border-slate-200
        disabled:hover:shadow-sm
      "
    >
      <span
        className="
          flex h-10 w-10
          shrink-0 items-center
          justify-center
          rounded-lg bg-slate-100
          text-slate-700
          transition-colors
          group-hover:bg-slate-200
          group-disabled:group-hover:bg-slate-100
        "
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span
          className="
            block font-semibold
            text-slate-950
          "
        >
          {label}
        </span>

        <span
          className="
            mt-1 block text-sm
            leading-5 text-slate-600
          "
        >
          {description}
        </span>
      </span>
    </button>
  );
}

export default function TripQuickActions({
  onAddParticipant,
  onAssignCharge,
  onRegisterPayment,
  onEditTrip,
}: TripQuickActionsProps) {
  return (
    <section
      className="
        rounded-2xl border
        border-slate-200 bg-slate-50
        p-5
      "
    >
      <div className="mb-4">
        <h2
          className="
            text-lg font-bold
            tracking-tight text-slate-950
          "
        >
          Acciones rápidas
        </h2>

        <p
          className="
            mt-1 text-sm
            text-slate-600
          "
        >
          Accesos directos para administrar
          este viaje.
        </p>
      </div>

      <div
        className="
          grid gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <QuickActionButton
          label="Agregar participante"
          description={
            onAddParticipant
              ? "Inscribe integrantes en este viaje."
              : "Disponible próximamente."
          }
          icon={
            <UserPlus
              aria-hidden="true"
              className="h-5 w-5"
            />
          }
          onClick={onAddParticipant}
        />

        <QuickActionButton
          label="Asignar cargos"
          description={
            onAssignCharge
              ? "Genera cargos relacionados con el viaje."
              : "Disponible próximamente."
          }
          icon={
            <ReceiptText
              aria-hidden="true"
              className="h-5 w-5"
            />
          }
          onClick={onAssignCharge}
        />

        <QuickActionButton
          label="Registrar pago"
          description={
            onRegisterPayment
              ? "Registra un abono de un participante."
              : "Disponible próximamente."
          }
          icon={
            <Banknote
              aria-hidden="true"
              className="h-5 w-5"
            />
          }
          onClick={onRegisterPayment}
        />

        <QuickActionButton
  label="Editar viaje"
  description={
    onEditTrip
      ? "Actualiza los datos generales del viaje."
      : "Disponible próximamente."
  }
  icon={
    <FilePenLine
      aria-hidden="true"
      className="h-5 w-5"
    />
  }
  onClick={onEditTrip}
/>
      </div>
    </section>
  );
}