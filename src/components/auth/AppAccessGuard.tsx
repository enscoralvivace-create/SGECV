"use client";

import { ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceLoading from "@/components/ui/VivaceLoading";
import {
  ALL_NAVIGATION_ITEMS,
  isNavigationItemActive,
  type NavigationItem,
} from "@/config/navigation";
import useUserAccess from "@/hooks/useUserAccess";
import { supabase } from "@/lib/supabase";
import type { AppPermission } from "@/types/accessControl";

interface AppAccessGuardProps {
  children: ReactNode;
}

function hasNavigationPermission(
  item: NavigationItem,
  permissions: AppPermission[],
): boolean {
  if (item.permissions.length === 0) {
    return true;
  }

  if ((item.permissionMatch ?? "all") === "any") {
    return item.permissions.some((permission) =>
      permissions.includes(permission),
    );
  }

  return item.permissions.every((permission) =>
    permissions.includes(permission),
  );
}

function findCurrentRoute(pathname: string): NavigationItem | null {
  return (
    ALL_NAVIGATION_ITEMS.filter((item) =>
      isNavigationItemActive(pathname, item.href),
    ).sort(
      (first, second) => second.href.length - first.href.length,
    )[0] ?? null
  );
}

function findAccessibleRoute(permissions: AppPermission[]): string | null {
  return (
    ALL_NAVIGATION_ITEMS.find((item) =>
      hasNavigationPermission(item, permissions),
    )?.href ?? null
  );
}

export default function AppAccessGuard({
  children,
}: AppAccessGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    access,
    isAuthenticated,
    isLoading,
    error,
    reload,
  } = useUserAccess();

  useEffect(() => {
    if (!isLoading && !error && !isAuthenticated) {
      const returnTo =
        pathname === "/"
          ? ""
          : `?returnTo=${encodeURIComponent(pathname)}`;

      router.replace(`/login${returnTo}`);
    }
  }, [error, isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <VivaceLoading variant="page" message="Verificando acceso..." />
    );
  }

  if (!isAuthenticated && !error) {
    return (
      <VivaceLoading
        variant="page"
        message="Redirigiendo al inicio de sesión..."
      />
    );
  }

  if (error) {
    return (
      <AccessRestrictedView
        description={error}
        primaryLabel="Revisar acceso"
        onPrimaryAction={() => reload()}
      />
    );
  }

  if (
    !access ||
    !access.isActive ||
    access.roles.length === 0
  ) {
    return (
      <AccessRestrictedView
        description="Tu cuenta no está activa o no tiene un perfil vinculado. Cierra esta sesión para ingresar con otra cuenta."
        primaryLabel="Cerrar sesión e iniciar con otra cuenta"
        onPrimaryAction={async () => {
          const { error: signOutError } = await supabase.auth.signOut({
            scope: "local",
          });

          if (signOutError) {
            throw signOutError;
          }

          router.replace("/login");
          router.refresh();
        }}
        secondaryLabel="Revisar acceso"
        onSecondaryAction={() => reload()}
      />
    );
  }

  const currentRoute = findCurrentRoute(pathname);

  if (!currentRoute) {
    return <>{children}</>;
  }

  if (!hasNavigationPermission(currentRoute, access.permissions)) {
    const accessibleRoute = findAccessibleRoute(access.permissions);

    return (
      <AccessRestrictedView
        description="Tu cuenta no tiene permiso para consultar este módulo."
        primaryLabel={
          accessibleRoute === "/"
            ? "Volver al dashboard"
            : "Ir a una sección disponible"
        }
        onPrimaryAction={() => {
          if (accessibleRoute) {
            router.replace(accessibleRoute);
            return;
          }

          return reload();
        }}
        secondaryLabel="Revisar permisos"
        onSecondaryAction={() => reload()}
      />
    );
  }

  return <>{children}</>;
}

interface AccessRestrictedViewProps {
  description: string;
  primaryLabel: string;
  onPrimaryAction: () => void | Promise<void>;
  secondaryLabel?: string;
  onSecondaryAction?: () => void | Promise<void>;
}

function AccessRestrictedView({
  description,
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
}: AccessRestrictedViewProps) {
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState("");

  async function runAction(
    action: () => void | Promise<void>,
  ): Promise<void> {
    if (isActing) {
      return;
    }

    try {
      setIsActing(true);
      setActionError("");
      await action();
    } catch (currentError: unknown) {
      console.error(currentError);
      setActionError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible completar la acción.",
      );
    } finally {
      setIsActing(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-8">
      <VivaceCard className="w-full max-w-md">
        <VivaceCard.Body className="p-6 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
            <ShieldAlert aria-hidden="true" className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Acceso restringido
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {description}
          </p>

          {actionError ? (
            <p className="mt-3 text-sm font-medium text-rose-700" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {secondaryLabel && onSecondaryAction ? (
              <VivaceButton
                variant="outline"
                disabled={isActing}
                onClick={() => void runAction(onSecondaryAction)}
              >
                {secondaryLabel}
              </VivaceButton>
            ) : null}

            <VivaceButton
              loading={isActing}
              onClick={() => void runAction(onPrimaryAction)}
            >
              {primaryLabel}
            </VivaceButton>
          </div>
        </VivaceCard.Body>
      </VivaceCard>
    </main>
  );
}
