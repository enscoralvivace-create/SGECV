"use client";

import Link from "next/link";

import {
  ShieldAlert,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  ALL_NAVIGATION_ITEMS,
  isNavigationItemActive,
  type NavigationItem,
} from "@/config/navigation";

import useUserAccess from "@/hooks/useUserAccess";

import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceLoading from "@/components/ui/VivaceLoading";

import type {
  AppPermission,
} from "@/types/accessControl";

interface AppAccessGuardProps {
  children: ReactNode;
}

function hasNavigationPermission(
  item: NavigationItem,
  permissions: AppPermission[],
): boolean {
  const match =
    item.permissionMatch ??
    "all";

  if (
    item.permissions.length === 0
  ) {
    return true;
  }

  if (match === "any") {
    return item.permissions.some(
      (permission) =>
        permissions.includes(
          permission,
        ),
    );
  }

  return item.permissions.every(
    (permission) =>
      permissions.includes(
        permission,
      ),
  );
}

function findCurrentRoute(
  pathname: string,
): NavigationItem | null {
  const matchingItems =
    ALL_NAVIGATION_ITEMS
      .filter(
        (item) =>
          isNavigationItemActive(
            pathname,
            item.href,
          ),
      )
      .sort(
        (first, second) =>
          second.href.length -
          first.href.length,
      );

  return (
    matchingItems[0] ??
    null
  );
}

export default function AppAccessGuard({
  children,
}: AppAccessGuardProps) {
  const pathname =
    usePathname();

  const {
    access,
    isLoading,
    error,
    reload,
  } = useUserAccess();

  if (isLoading) {
    return (
      <VivaceLoading
        variant="page"
        message="Verificando acceso..."
      />
    );
  }

  if (
    error ||
    !access ||
    !access.isActive
  ) {
    return (
      <AccessRestrictedView
        description={
          error ||
          "Tu cuenta no está activa o no tiene un perfil vinculado."
        }
        onReload={() => {
          void reload();
        }}
      />
    );
  }

  const currentRoute =
    findCurrentRoute(
      pathname,
    );

  if (!currentRoute) {
    return <>{children}</>;
  }

  const isAllowed =
    hasNavigationPermission(
      currentRoute,
      access.permissions,
    );

  if (!isAllowed) {
    return (
      <AccessRestrictedView
        description="Tu cuenta no tiene permiso para consultar este módulo."
        onReload={() => {
          void reload();
        }}
      />
    );
  }

  return <>{children}</>;
}

interface AccessRestrictedViewProps {
  description: string;
  onReload: () => void;
}

function AccessRestrictedView({
  description,
  onReload,
}: AccessRestrictedViewProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-8">
      <VivaceCard className="w-full max-w-md">
        <VivaceCard.Body className="p-6 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
            <ShieldAlert
              aria-hidden="true"
              className="h-7 w-7"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Acceso restringido
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {description}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <VivaceButton
              variant="outline"
              onClick={onReload}
            >
              Revisar permisos
            </VivaceButton>

            <Link
              href="/mi-cuenta"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
            >
              Ir a mi cuenta
            </Link>
          </div>
        </VivaceCard.Body>
      </VivaceCard>
    </main>
  );
}
