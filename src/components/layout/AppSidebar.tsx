"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import {
  CalendarDays,
  CheckCircle2,
  ChartNoAxesCombined,
  CircleDollarSign,
  House,
  Music2,
  Plane,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  MAIN_NAVIGATION_ITEMS,
  SECONDARY_NAVIGATION_ITEMS,
  filterNavigationItems,
  isNavigationItemActive,
  type NavigationIconName,
  type NavigationItem,
} from "@/config/navigation";

import useUserAccess from "@/hooks/useUserAccess";

import VivaceBrandMark from "@/components/ui/VivaceBrandMark";

const NAVIGATION_ICONS:
Record<NavigationIconName, LucideIcon> = {
  home: House,
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
    access?.permissions ?? [];

  const mainItems =
    filterNavigationItems(
      MAIN_NAVIGATION_ITEMS,
      permissions,
    );

  const secondaryItems =
    filterNavigationItems(
      SECONDARY_NAVIGATION_ITEMS,
      permissions,
    );

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <SidebarBrand />

      <nav
        aria-label="Navegación principal"
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        {isLoading ? (
          <NavigationLoadingState />
        ) : error ? (
          <NavigationErrorState
            message={error}
          />
        ) : mainItems.length > 0 ? (
          <div className="space-y-1">
            {mainItems.map((item) => (
              <NavigationLink
                key={item.id}
                item={item}
                pathname={pathname}
              />
            ))}
          </div>
        ) : (
          <NavigationEmptyState />
        )}
      </nav>

      {!isLoading &&
      !error &&
      secondaryItems.length > 0 ? (
        <div className="border-t border-slate-200 p-4">
          {secondaryItems.map(
            (item) => (
              <NavigationLink
                key={item.id}
                item={item}
                pathname={pathname}
              />
            ),
          )}
        </div>
      ) : null}
    </aside>
  );
}

function SidebarBrand() {
  return (
    <div className="relative overflow-hidden border-b border-slate-200 px-6 py-6">
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[18px] border-emerald-900/5"
      />

      <VivaceBrandMark
        size="md"
        className="relative"
      />
    </div>
  );
}

interface NavigationLinkProps {
  item: NavigationItem;
  pathname: string;
}

function NavigationLink({
  item,
  pathname,
}: NavigationLinkProps) {
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
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
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

      <span className="min-w-0 truncate">
        {item.label}
      </span>
    </Link>
  );
}

function NavigationLoadingState() {
  return (
    <div
      aria-label="Cargando navegación"
      className="space-y-3"
    >
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 rounded-xl px-4 py-3"
        >
          <div className="h-9 w-9 rounded-lg bg-slate-100" />
          <div className="h-4 flex-1 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

interface NavigationErrorStateProps {
  message: string;
}

function NavigationErrorState({
  message,
}: NavigationErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 p-4"
    >
      <p className="text-sm font-semibold text-rose-800">
        No fue posible cargar la navegación
      </p>

      <p className="mt-2 text-xs leading-5 text-rose-700">
        {message}
      </p>
    </div>
  );
}

function NavigationEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
      <p className="text-sm font-semibold text-slate-700">
        Sin módulos disponibles
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        La cuenta actual no tiene permisos de navegación asignados.
      </p>
    </div>
  );
}