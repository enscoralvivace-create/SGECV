"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleDollarSign,
  CircleUserRound,
  House,
  Music2,
  Plane,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  getDesktopNavigationItems,
  isNavigationItemActive,
  type NavigationIconName,
  type NavigationItem,
} from "@/config/navigation";

import useUserAccess from "@/hooks/useUserAccess";

const NAVIGATION_ICONS:
Record<NavigationIconName, LucideIcon> = {
  home: House,
  userCircle: CircleUserRound,
  users: Users,
  calendar: CalendarDays,
  checkCircle: CheckCircle2,
  music: Music2,
  wallet: CircleDollarSign,
  plane: Plane,
  chart: ChartNoAxesCombined,
  settings: Settings,
};

export default function AppSidebar() {
  const pathname =
    usePathname();

  const {
    access,
    isLoading,
    error,
  } = useUserAccess();

  const permissions =
    useMemo(
      () =>
        access?.permissions ?? [],
      [access],
    );

  const navigationItems =
    useMemo(
      () =>
        getDesktopNavigationItems(
          permissions,
        ),
      [permissions],
    );

  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <Link
        href="/"
        className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 transition hover:bg-emerald-50/50"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-900/10 bg-emerald-50 p-1.5">
          <Image
            src="/images/logo-ecv-v2.png"
            alt="Ensamble Coral Vivace"
            width={48}
            height={48}
            priority
            className="h-full w-full object-contain"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
            Ensamble Coral Vivace
          </p>

          <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-slate-950">
            Vivace Suite
          </p>

          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Gestión coral
          </p>
        </div>
      </Link>

      <nav
        aria-label="Navegación principal"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5"
      >
        {isLoading ? (
          <SidebarLoading />
        ) : error ? (
          <SidebarError
            message={error}
          />
        ) : navigationItems.length > 0 ? (
          <div className="space-y-1">
            {navigationItems.map(
              (item) => (
                <SidebarLink
                  key={item.id}
                  item={item}
                  pathname={pathname}
                />
              ),
            )}
          </div>
        ) : (
          <SidebarEmpty />
        )}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        <p className="text-center text-xs leading-5 text-slate-500">
          Ensamble Coral Vivace
        </p>
      </div>
    </aside>
  );
}

interface SidebarLinkProps {
  item: NavigationItem;
  pathname: string;
}

function SidebarLink({
  item,
  pathname,
}: SidebarLinkProps) {
  const Icon =
    NAVIGATION_ICONS[item.icon];

  const isActive =
    isNavigationItemActive(
      pathname,
      item.href,
    );

  return (
    <Link
      href={item.href}
      aria-current={
        isActive
          ? "page"
          : undefined
      }
      className={[
        "group flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
        isActive
          ? "bg-emerald-950 text-white shadow-sm"
          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-950",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
          isActive
            ? "bg-white/10 text-emerald-100"
            : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-emerald-800",
        ].join(" ")}
      >
        <Icon
          aria-hidden="true"
          className="h-5 w-5"
          strokeWidth={1.9}
        />
      </span>

      <span className="min-w-0 flex-1 truncate">
        {item.label}
      </span>
    </Link>
  );
}

function SidebarLoading() {
  return (
    <div className="space-y-2">
      {Array.from({
        length: 7,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2.5"
        >
          <div className="h-9 w-9 rounded-lg bg-slate-100" />
          <div className="h-4 flex-1 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

interface SidebarErrorProps {
  message: string;
}

function SidebarError({
  message,
}: SidebarErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 p-4"
    >
      <p className="text-sm font-semibold text-rose-800">
        No fue posible cargar el menú
      </p>

      <p className="mt-2 text-xs leading-5 text-rose-700">
        {message}
      </p>
    </div>
  );
}

function SidebarEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
      <p className="text-sm font-semibold text-slate-700">
        Sin módulos disponibles
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        La cuenta actual no tiene permisos asignados.
      </p>
    </div>
  );
}
