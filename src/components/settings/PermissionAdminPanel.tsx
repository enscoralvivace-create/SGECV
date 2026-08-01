"use client";

import {
  RotateCcw,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  PERMISSION_DEFINITIONS,
  PERMISSION_GROUPS,
} from "@/config/permissionCatalog";

import {
  getInheritedPermissions,
  type PermissionAdminMember,
  type PermissionOverrideRecord,
} from "@/services/permissionAdminService";

import VivaceBadge from "@/components/ui/VivaceBadge";
import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceInput from "@/components/ui/VivaceInput";
import VivaceLoading from "@/components/ui/VivaceLoading";
import VivacePageHeader from "@/components/ui/VivacePageHeader";

import usePermissionAdmin from "@/hooks/usePermissionAdmin";

import {
  ROLE_LABELS,
  type AppPermission,
} from "@/types/accessControl";

type PermissionState =
  | "inherited"
  | "granted"
  | "revoked";

function getOverride(
  overrides:
    PermissionOverrideRecord[],
  authUserId: string,
  permission: AppPermission,
): PermissionOverrideRecord | null {
  return (
    overrides.find(
      (override) =>
        override.authUserId ===
          authUserId &&
        override.permission ===
          permission,
    ) ?? null
  );
}

function getPermissionState(
  member:
    PermissionAdminMember,
  overrides:
    PermissionOverrideRecord[],
  permission: AppPermission,
): PermissionState {
  if (!member.authUserId) {
    return "inherited";
  }

  const override =
    getOverride(
      overrides,
      member.authUserId,
      permission,
    );

  if (override) {
    return override.isGranted
      ? "granted"
      : "revoked";
  }

  return "inherited";
}

export default function PermissionAdminPanel() {
  const {
    members,
    overrides,
    isLoading,
    isSaving,
    error,
    reload,
    setOverride,
    removeOverride,
  } = usePermissionAdmin();

  const [
    selectedMemberId,
    setSelectedMemberId,
  ] = useState<number | null>(
    null,
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const filteredMembers =
    useMemo(
      () => {
        const normalized =
          search
            .trim()
            .toLowerCase();

        if (!normalized) {
          return members;
        }

        return members.filter(
          (member) =>
            [
              member.fullName,
              member.email ?? "",
              ROLE_LABELS[
                member.role
              ],
            ].some(
              (value) =>
                value
                  .toLowerCase()
                  .includes(
                    normalized,
                  ),
            ),
        );
      },
      [
        members,
        search,
      ],
    );

  const selectedMember =
    useMemo(
      () =>
        members.find(
          (member) =>
            member.id ===
              selectedMemberId,
        ) ??
        members[0] ??
        null,
      [
        members,
        selectedMemberId,
      ],
    );

  if (isLoading) {
    return (
      <VivaceLoading
        variant="page"
        message="Cargando roles y permisos..."
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Administración"
          title="Roles y permisos"
          description="Gestiona permisos individuales sin modificar el rol base de cada persona."
          actions={
            <VivaceButton
              variant="outline"
              leftIcon={
                <RotateCcw className="h-4 w-4" />
              }
              loading={isLoading}
              onClick={() => {
                void reload();
              }}
            >
              Actualizar
            </VivaceButton>
          }
        />

        {error ? (
          <VivaceCard className="mb-4 border-rose-200 bg-rose-50 sm:mb-6">
            <VivaceCard.Body>
              <div
                role="alert"
                className="flex items-start gap-3"
              >
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />

                <p className="text-sm leading-6 text-rose-800">
                  {error}
                </p>
              </div>
            </VivaceCard.Body>
          </VivaceCard>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
          <VivaceCard className="h-fit">
            <VivaceCard.Header>
              <h2 className="font-bold text-slate-950">
                Personas
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Selecciona una cuenta vinculada.
              </p>
            </VivaceCard.Header>

            <VivaceCard.Body className="space-y-4">
              <VivaceInput
                value={search}
                placeholder="Buscar persona..."
                leftIcon={
                  <Search className="h-4 w-4" />
                }
                onChange={(
                  event,
                ) => {
                  setSearch(
                    event.target.value,
                  );
                }}
              />

              <div className="max-h-[62dvh] space-y-2 overflow-y-auto overscroll-contain pr-1">
                {filteredMembers.map(
                  (member) => {
                    const isSelected =
                      selectedMember?.id ===
                      member.id;

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setSelectedMemberId(
                            member.id,
                          );
                        }}
                        className={[
                          "w-full rounded-xl border p-3 text-left transition",
                          isSelected
                            ? "border-emerald-800 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40",
                        ].join(" ")}
                      >
                        <p className="truncate text-sm font-bold text-slate-950">
                          {member.fullName}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <VivaceBadge
                            size="sm"
                            tone={
                              member.role ===
                              "admin"
                                ? "brand"
                                : "neutral"
                            }
                          >
                            {
                              ROLE_LABELS[
                                member.role
                              ]
                            }
                          </VivaceBadge>

                          {!member.authUserId ? (
                            <VivaceBadge
                              size="sm"
                              tone="warning"
                            >
                              Sin cuenta vinculada
                            </VivaceBadge>
                          ) : null}
                        </div>
                      </button>
                    );
                  },
                )}

                {filteredMembers.length ===
                0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                    No se encontraron personas.
                  </p>
                ) : null}
              </div>
            </VivaceCard.Body>
          </VivaceCard>

          {selectedMember ? (
            <PermissionEditor
              member={selectedMember}
              overrides={overrides}
              isSaving={isSaving}
              onSetOverride={
                setOverride
              }
              onRemoveOverride={
                removeOverride
              }
            />
          ) : (
            <VivaceCard>
              <VivaceCard.Body className="py-12 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />

                <p className="mt-4 font-semibold text-slate-700">
                  No hay usuarios disponibles
                </p>
              </VivaceCard.Body>
            </VivaceCard>
          )}
        </div>
      </div>
    </main>
  );
}

interface PermissionEditorProps {
  member: PermissionAdminMember;
  overrides:
    PermissionOverrideRecord[];
  isSaving: boolean;
  onSetOverride: (
    authUserId: string,
    permission: AppPermission,
    isGranted: boolean,
  ) => Promise<void>;
  onRemoveOverride: (
    authUserId: string,
    permission: AppPermission,
  ) => Promise<void>;
}

function PermissionEditor({
  member,
  overrides,
  isSaving,
  onSetOverride,
  onRemoveOverride,
}: PermissionEditorProps) {
  const inherited =
    useMemo(
      () =>
        new Set(
          getInheritedPermissions(
            member.role,
          ),
        ),
      [member.role],
    );

  return (
    <VivaceCard>
      <VivaceCard.Header>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-slate-950">
              {member.fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Rol base:{" "}
              <strong>
                {
                  ROLE_LABELS[
                    member.role
                  ]
                }
              </strong>
            </p>
          </div>

          <VivaceBadge
            tone={
              member.status
                .trim()
                .toLowerCase() ===
              "activo"
                ? "success"
                : "warning"
            }
            dot
          >
            {member.status}
          </VivaceBadge>
        </div>
      </VivaceCard.Header>

      <VivaceCard.Body className="space-y-6">
        {!member.authUserId ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Esta persona todavía no tiene una cuenta de autenticación vinculada. No se pueden guardar permisos individuales.
          </div>
        ) : null}

        {PERMISSION_GROUPS.map(
          (group) => (
            <section
              key={group}
              className="space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                {group}
              </h3>

              <div className="grid gap-3 xl:grid-cols-2">
                {PERMISSION_DEFINITIONS.filter(
                  (definition) =>
                    definition.group ===
                    group,
                ).map(
                  (definition) => {
                    const state =
                      getPermissionState(
                        member,
                        overrides,
                        definition.permission,
                      );

                    const inheritedValue =
                      inherited.has(
                        definition.permission,
                      );

                    const effectiveValue =
                      state ===
                      "granted"
                        ? true
                        : state ===
                            "revoked"
                          ? false
                          : inheritedValue;

                    return (
                      <article
                        key={
                          definition.permission
                        }
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900">
                              {
                                definition.label
                              }
                            </h4>

                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {
                                definition.description
                              }
                            </p>
                          </div>

                          <VivaceBadge
                            size="sm"
                            tone={
                              effectiveValue
                                ? "success"
                                : "neutral"
                            }
                          >
                            {effectiveValue
                              ? "Permitido"
                              : "Bloqueado"}
                          </VivaceBadge>
                        </div>

                        <p className="mt-3 text-xs font-medium text-slate-500">
                          Estado:{" "}
                          {state ===
                          "inherited"
                            ? `Heredado del rol (${inheritedValue ? "permitido" : "bloqueado"})`
                            : state ===
                                "granted"
                              ? "Concedido individualmente"
                              : "Revocado individualmente"}
                        </p>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <VivaceButton
                            size="sm"
                            variant={
                              state ===
                              "granted"
                                ? "primary"
                                : "outline"
                            }
                            disabled={
                              !member.authUserId ||
                              isSaving
                            }
                            onClick={() => {
                              if (
                                member.authUserId
                              ) {
                                void onSetOverride(
                                  member.authUserId,
                                  definition.permission,
                                  true,
                                );
                              }
                            }}
                          >
                            Conceder
                          </VivaceButton>

                          <VivaceButton
                            size="sm"
                            variant={
                              state ===
                              "revoked"
                                ? "danger"
                                : "outline"
                            }
                            disabled={
                              !member.authUserId ||
                              isSaving
                            }
                            onClick={() => {
                              if (
                                member.authUserId
                              ) {
                                void onSetOverride(
                                  member.authUserId,
                                  definition.permission,
                                  false,
                                );
                              }
                            }}
                          >
                            Revocar
                          </VivaceButton>

                          <VivaceButton
                            size="sm"
                            variant="ghost"
                            disabled={
                              !member.authUserId ||
                              state ===
                                "inherited" ||
                              isSaving
                            }
                            onClick={() => {
                              if (
                                member.authUserId
                              ) {
                                void onRemoveOverride(
                                  member.authUserId,
                                  definition.permission,
                                );
                              }
                            }}
                          >
                            Heredar
                          </VivaceButton>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </section>
          ),
        )}
      </VivaceCard.Body>
    </VivaceCard>
  );
}
