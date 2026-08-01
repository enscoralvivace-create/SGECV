"use client";

import {
  BarChart3,
  CalendarDays,
  GraduationCap,
  Mail,
  Music2,
  Phone,
  Plane,
  WalletCards,
} from "lucide-react";

import MemberAttendanceStatsPanel from "@/components/attendance/MemberAttendanceStatsPanel";
import VivaceAvatar from "@/components/ui/VivaceAvatar";
import VivaceBadge from "@/components/ui/VivaceBadge";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceModal from "@/components/ui/VivaceModal";

import type {
  Member,
} from "@/types/member";

interface MemberStatisticsModalProps {
  member: Member;
  onClose: () => void;
}

interface MemberSectionTab {
  id:
    | "attendance"
    | "fees"
    | "trips"
    | "repertoire"
    | "classes";
  label: string;
  icon: typeof BarChart3;
  available: boolean;
}

const MEMBER_SECTION_TABS:
MemberSectionTab[] = [
  {
    id: "attendance",
    label: "Asistencias",
    icon: BarChart3,
    available: true,
  },
  {
    id: "fees",
    label: "Cuotas",
    icon: WalletCards,
    available: false,
  },
  {
    id: "trips",
    label: "Viajes",
    icon: Plane,
    available: false,
  },
  {
    id: "repertoire",
    label: "Repertorio",
    icon: Music2,
    available: false,
  },
  {
    id: "classes",
    label: "Clases",
    icon: GraduationCap,
    available: false,
  },
];

function buildMemberName(
  member: Member,
): string {
  return [
    member.name,
    member.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function getStatusTone(
  status: string,
):
  | "success"
  | "warning"
  | "neutral" {
  const normalized =
    status
      .trim()
      .toLowerCase();

  if (
    normalized === "activo" ||
    normalized === "active"
  ) {
    return "success";
  }

  if (
    normalized === "pendiente" ||
    normalized === "pending"
  ) {
    return "warning";
  }

  return "neutral";
}

function formatJoinDate(
  value: string | null,
): string {
  if (!value) {
    return "Sin registrar";
  }

  const [
    year,
    month,
    day,
  ] = value
    .slice(0, 10)
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  );
}

export default function MemberStatisticsModal({
  member,
  onClose,
}: MemberStatisticsModalProps) {
  const fullName =
    buildMemberName(
      member,
    );

  const isActive =
    member.status
      .trim()
      .toLowerCase() ===
    "activo";

  return (
    <VivaceModal
      isOpen
      onClose={onClose}
      size="full"
      title="Ficha del integrante"
      description="Consulta la información individual del integrante."
      className="max-w-7xl"
    >
      <div className="space-y-5">
        <VivaceCard
          gradient
          className="overflow-hidden border-emerald-100"
        >
          <VivaceCard.Body className="p-5 sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                <VivaceAvatar
                  name={fullName}
                  size="xl"
                  status={
                    isActive
                      ? "online"
                      : "offline"
                  }
                />

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                    Integrante
                  </p>

                  <h2 className="mt-1 truncate text-3xl font-bold tracking-tight text-slate-950">
                    {fullName}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <VivaceBadge
                      tone={
                        getStatusTone(
                          member.status,
                        )
                      }
                      dot
                    >
                      {member.status}
                    </VivaceBadge>

                    {member.voice ? (
                      <VivaceBadge
                        tone="brand"
                        icon={
                          <Music2 className="h-3.5 w-3.5" />
                        }
                      >
                        {member.voice}
                      </VivaceBadge>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[430px]">
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <CalendarDays className="h-4 w-4 text-emerald-800" />
                    Ingreso
                  </div>

                  <p className="mt-2 font-bold text-slate-900">
                    {formatJoinDate(
                      member.join_date,
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Phone className="h-4 w-4 text-emerald-800" />
                    Teléfono
                  </div>

                  <p className="mt-2 break-words font-bold text-slate-900">
                    {member.phone ||
                      "Sin registrar"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Mail className="h-4 w-4 text-emerald-800" />
                    Correo electrónico
                  </div>

                  <p className="mt-2 break-all font-bold text-slate-900">
                    {member.email ||
                      "Sin registrar"}
                  </p>
                </div>
              </div>
            </div>
          </VivaceCard.Body>
        </VivaceCard>

        <VivaceCard className="overflow-hidden">
          <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
            {MEMBER_SECTION_TABS.map(
              (tab) => {
                const Icon =
                  tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={
                      !tab.available
                    }
                    className={[
                      "flex min-w-max items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition",
                      tab.available
                        ? "border-emerald-900 bg-white text-emerald-950"
                        : "border-transparent text-slate-400",
                      !tab.available
                        ? "cursor-not-allowed"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <Icon className="h-4 w-4" />

                    <span>
                      {tab.label}
                    </span>

                    {!tab.available ? (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Próximamente
                      </span>
                    ) : null}
                  </button>
                );
              },
            )}
          </div>

          <VivaceCard.Body className="bg-slate-50/40">
            <MemberAttendanceStatsPanel
              memberId={member.id}
            />
          </VivaceCard.Body>
        </VivaceCard>
      </div>
    </VivaceModal>
  );
}