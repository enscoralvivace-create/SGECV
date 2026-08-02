"use client";

import type {
  ReactNode,
} from "react";

import AccessDenied from "@/components/auth/AccessDenied";
import VivaceLoading from "@/components/ui/VivaceLoading";

import useUserAccess from "@/hooks/useUserAccess";

import type {
  AppPermission,
  AppRole,
} from "@/types/accessControl";

type MatchMode =
  | "all"
  | "any";

interface PermissionGuardProps {
  children: ReactNode;
  permissions?:
    AppPermission[];
  roles?: AppRole[];
  match?: MatchMode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  requireActiveUser?: boolean;
}

function matchesValues<T>(
  current: T[],
  required: T[],
  mode: MatchMode,
): boolean {
  if (
    required.length === 0
  ) {
    return true;
  }

  if (mode === "all") {
    return required.every(
      (value) =>
        current.includes(value),
    );
  }

  return required.some(
    (value) =>
      current.includes(value),
  );
}

export default function PermissionGuard({
  children,
  permissions = [],
  roles = [],
  match = "all",
  fallback,
  loadingFallback,
  requireActiveUser = true,
}: PermissionGuardProps) {
  const {
    access,
    isLoading,
    error,
    reload,
  } = useUserAccess();

  if (isLoading) {
    return (
      <>
        {loadingFallback ?? (
          <VivaceLoading
            variant="page"
            message="Verificando permisos..."
          />
        )}
      </>
    );
  }

  const isActive =
    !requireActiveUser ||
    access?.isActive === true;

  const hasRequiredPermissions =
    matchesValues(
      access?.permissions ?? [],
      permissions,
      match,
    );

  const hasRequiredRoles =
    matchesValues(
      access?.roles ?? [],
      roles,
      match,
    );

  const isAllowed =
    Boolean(access) &&
    isActive &&
    hasRequiredPermissions &&
    hasRequiredRoles;

  if (!isAllowed) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    return (
      <AccessDenied
        description={
          error ||
          "No tienes permisos para acceder a este contenido. Si consideras que se trata de un error, contacta a un administrador."
        }
        showReloadButton
        onReload={() => {
          void reload();
        }}
      />
    );
  }

  return <>{children}</>;
}
