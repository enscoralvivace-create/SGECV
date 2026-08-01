"use client";

import {
  Mail,
  Music2,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import MemberAttendanceStatsPanel from "@/components/attendance/MemberAttendanceStatsPanel";
import VivaceAvatar from "@/components/ui/VivaceAvatar";
import VivaceBadge from "@/components/ui/VivaceBadge";
import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceLoading from "@/components/ui/VivaceLoading";
import VivacePageHeader from "@/components/ui/VivacePageHeader";

import useCurrentUserProfile from "@/hooks/useCurrentUserProfile";
import { usePwaLifecycle } from "@/hooks/usePwaLifecycle";

function getStatusTone(
  status: string,
):
  | "success"
  | "warning"
  | "neutral" {
  const normalizedStatus =
    status
      .trim()
      .toLowerCase();

  if (
    normalizedStatus === "activo" ||
    normalizedStatus === "active"
  ) {
    return "success";
  }

  if (
    normalizedStatus === "pendiente" ||
    normalizedStatus === "pending"
  ) {
    return "warning";
  }

  return "neutral";
}

function getRoleLabel(
  role: string,
): string {
  switch (
    role
      .trim()
      .toLowerCase()
  ) {
    case "admin":
      return "Administrador";

    case "teacher":
      return "Profesor";

    case "student":
      return "Alumno";

    case "member":
      return "Integrante";

    default:
      return role;
  }
}

export default function MyAccountPage() {
  const {
    profile,
    isLoading,
    error,
    reload,
  } = useCurrentUserProfile();

  usePwaLifecycle({
    onAppResumed: () => {
      void reload();
    },
    onConnectionRestored: () => {
      void reload();
    },
  });

  if (isLoading) {
    return (
      <main className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <VivaceLoading
            variant="page"
            message="Cargando tu perfil..."
          />
        </div>
      </main>
    );
  }

  if (
    error ||
    !profile
  ) {
    return (
      <main className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <VivaceCard className="border-rose-200 bg-rose-50/70">
            <VivaceCard.Body className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 sm:h-11 sm:w-11">
                  <TriangleAlert className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-rose-900 sm:text-xl">
                    No fue posible cargar tu cuenta
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-rose-700">
                    {error ||
                      "La cuenta actual no tiene un perfil vinculado."}
                  </p>

                  <VivaceButton
                    variant="danger"
                    size="sm"
                    className="mt-4"
                    leftIcon={
                      <RefreshCw className="h-4 w-4" />
                    }
                    onClick={() => {
                      void reload();
                    }}
                  >
                    Reintentar
                  </VivaceButton>
                </div>
              </div>
            </VivaceCard.Body>
          </VivaceCard>
        </div>
      </main>
    );
  }

  const isActive =
    ["activo", "active"].includes(
      profile.status
        .trim()
        .toLowerCase(),
    );

  return (
    <main className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Portal personal"
          title="Mi cuenta"
          description="Consulta tu perfil y tus estadísticas personales dentro de Vivace Suite."
        />

        <VivaceCard
          gradient
          className="mb-4 overflow-hidden border-emerald-100 sm:mb-6"
        >
          <VivaceCard.Body className="p-4 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <VivaceAvatar
                  name={profile.fullName}
                  size="xl"
                  status={
                    isActive
                      ? "online"
                      : "offline"
                  }
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800 sm:text-xs sm:tracking-[0.2em]">
                    Perfil personal
                  </p>

                  <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {profile.fullName}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <VivaceBadge
                      tone={
                        getStatusTone(
                          profile.status,
                        )
                      }
                      dot
                    >
                      {profile.status}
                    </VivaceBadge>

                    <VivaceBadge
                      tone="brand"
                      icon={
                        <ShieldCheck className="h-3.5 w-3.5" />
                      }
                    >
                      {getRoleLabel(
                        profile.role,
                      )}
                    </VivaceBadge>

                    {profile.voice ? (
                      <VivaceBadge
                        tone="neutral"
                        icon={
                          <Music2 className="h-3.5 w-3.5" />
                        }
                      >
                        {profile.voice}
                      </VivaceBadge>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                    <UserRound className="h-4 w-4 text-emerald-800" />
                    Identificador
                  </div>

                  <p className="mt-2 truncate font-bold text-slate-900">
                    #{profile.id}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                    <Mail className="h-4 w-4 text-emerald-800" />
                    Correo
                  </div>

                  <p
                    className="mt-2 truncate font-bold text-slate-900"
                    title={profile.email}
                  >
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>
          </VivaceCard.Body>
        </VivaceCard>

        <MemberAttendanceStatsPanel
          memberId={profile.id}
        />
      </div>
    </main>
  );
}
