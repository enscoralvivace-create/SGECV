"use client";

import Link from "next/link";

import {
  useEffect,
  type ReactNode,
} from "react";

import {
  ShieldAlert,
  UserRoundX,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  ALL_NAVIGATION_ITEMS,
  isNavigationItemActive,
} from "@/config/navigation";

import useUserAccess from "@/hooks/useUserAccess";

interface AppAccessGuardProps {
  children: ReactNode;
}

export default function AppAccessGuard({
  children,
}: AppAccessGuardProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    access,
    isLoading,
    error,
    reload,
  } = useUserAccess();

  useEffect(() => {
    if (
      !isLoading &&
      !error &&
      !access
    ) {
      router.replace("/login");
    }
  }, [
    access,
    error,
    isLoading,
    router,
  ]);

  if (isLoading) {
    return <AccessLoadingState />;
  }

  if (error) {
    return (
      <AccessErrorState
        message={error}
        onRetry={() => {
          void reload();
        }}
      />
    );
  }

  if (!access) {
    return <AccessLoadingState />;
  }

  if (!access.isActive) {
    return <InactiveAccountState />;
  }

  const routeItem =
    ALL_NAVIGATION_ITEMS.find(
      (item) =>
        isNavigationItemActive(
          pathname,
          item.href,
        ),
    );

  const canAccessRoute =
    !routeItem ||
    access.permissions.includes(
      routeItem.permission,
    );

  if (!canAccessRoute) {
    return <AccessDeniedState />;
  }

  return children;
}

function AccessLoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-800" />

        <p className="mt-5 text-sm font-semibold text-slate-700">
          Verificando acceso...
        </p>
      </div>
    </main>
  );
}

interface AccessErrorStateProps {
  message: string;
  onRetry: () => void;
}

function AccessErrorState({
  message,
  onRetry,
}: AccessErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div
        role="alert"
        className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"
      >
        <ShieldAlert className="mx-auto h-12 w-12 text-rose-600" />

        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          No fue posible verificar el acceso
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-950"
        >
          Intentar nuevamente
        </button>
      </div>
    </main>
  );
}

function InactiveAccountState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <UserRoundX className="mx-auto h-12 w-12 text-amber-600" />

        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Cuenta pendiente de activación
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          La administración debe activar tu perfil antes de que puedas utilizar Vivace Suite.
        </p>

        <Link
          href="/login"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </main>
  );
}

function AccessDeniedState() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-12 w-12 text-emerald-800" />

        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Acceso restringido
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Tu cuenta no tiene permiso para consultar este módulo.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-950"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}