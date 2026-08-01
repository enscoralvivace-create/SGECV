"use client";

import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import {
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleDollarSign,
  CircleUserRound,
  House,
  Menu,
  Music2,
  Plane,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMobileBarNavigationItems,
  getMobileMenuNavigationItems,
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

export default function AppMobileNavigation() {
  const pathname =
    usePathname();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

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

  const mobileBarItems =
    useMemo(
      () =>
        getMobileBarNavigationItems(
          permissions,
        ).slice(0, 4),
      [permissions],
    );

  const mobileMenuItems =
    useMemo(
      () =>
        getMobileMenuNavigationItems(
          permissions,
        ),
      [permissions],
    );

  function closeMenu(): void {
    setIsMenuOpen(false);
  }

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-900/10 bg-emerald-50 p-1">
            <Image
              src="/images/logo-ecv-v2.png"
              alt="Ensamble Coral Vivace"
              width={44}
              height={44}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
              Ensamble Coral Vivace
            </p>

            <p className="truncate text-lg font-bold tracking-tight text-slate-900">
              Vivace Suite
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() =>
            setIsMenuOpen(
              (current) => !current,
            )
          }
          aria-controls="mobile-navigation-panel"
          aria-label={
            isMenuOpen
              ? "Cerrar menú"
              : "Abrir menú"
          }
          aria-expanded={isMenuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-95"
        >
          {isMenuOpen ? (
            <X
              aria-hidden="true"
              className="h-5 w-5"
            />
          ) : (
            <Menu
              aria-hidden="true"
              className="h-5 w-5"
            />
          )}
        </button>
      </header>

      {isMenuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeMenu();
            }
          }}
          role="presentation"
        >
          <aside
            id="mobile-navigation-panel"
            aria-label="Menú principal"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-emerald-900 bg-emerald-950 px-5 pb-5 pt-[max(1.25rem,var(--safe-top))] text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Menú principal
                </p>

                <p className="mt-1 text-lg font-bold">
                  Vivace Suite
                </p>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                aria-label="Cerrar menú"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/15 active:scale-95"
              >
                <X
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </button>
            </div>

            <nav
              aria-label="Navegación móvil"
              className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {isLoading ? (
                <MobileNavigationLoading />
              ) : error ? (
                <MobileNavigationError
                  message={error}
                />
              ) : mobileMenuItems.length > 0 ? (
                <div className="space-y-1">
                  {mobileMenuItems.map(
                    (item) => (
                      <MobileMenuLink
                        key={item.id}
                        item={item}
                        pathname={pathname}
                        onNavigate={closeMenu}
                      />
                    ),
                  )}
                </div>
              ) : (
                <MobileNavigationEmpty />
              )}
            </nav>

            <div className="border-t border-slate-200 px-5 pb-[max(1rem,var(--safe-bottom))] pt-4">
              <p className="text-center text-xs leading-5 text-slate-500">
                Ensamble Coral Vivace
              </p>
            </div>
          </aside>
        </div>
      ) : null}

      {!isLoading &&
      !error &&
      mobileBarItems.length > 0 ? (
        <nav
          aria-label="Accesos rápidos"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,var(--safe-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
        >
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
            {mobileBarItems.map(
              (item) => (
                <MobileBarLink
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeMenu}
                />
              ),
            )}
          </div>
        </nav>
      ) : null}
    </>
  );
}

interface MobileMenuLinkProps {
  item: NavigationItem;
  pathname: string;
  onNavigate: () => void;
}

function MobileMenuLink({
  item,
  pathname,
  onNavigate,
}: MobileMenuLinkProps) {
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
      onClick={onNavigate}
      aria-current={
        isActive
          ? "page"
          : undefined
      }
      className={[
        "flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99]",
        isActive
          ? "bg-emerald-950 text-white"
          : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-950",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isActive
            ? "bg-white/10 text-emerald-100"
            : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        <Icon
          aria-hidden="true"
          className="h-5 w-5"
          strokeWidth={1.9}
        />
      </span>

      <span className="truncate">
        {item.label}
      </span>
    </Link>
  );
}

interface MobileBarLinkProps {
  item: NavigationItem;
  pathname: string;
  onNavigate: () => void;
}

function MobileBarLink({
  item,
  pathname,
  onNavigate,
}: MobileBarLinkProps) {
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
      onClick={onNavigate}
      aria-current={
        isActive
          ? "page"
          : undefined
      }
      className={[
        "flex min-h-14 min-w-0 flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] font-semibold transition active:scale-95",
        isActive
          ? "bg-emerald-950 text-white"
          : "text-slate-500",
      ].join(" ")}
    >
      <Icon
        aria-hidden="true"
        className="h-5 w-5"
        strokeWidth={1.9}
      />

      <span className="mt-1 max-w-full truncate">
        {item.shortLabel}
      </span>
    </Link>
  );
}

function MobileNavigationLoading() {
  return (
    <div className="space-y-3">
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

interface MobileNavigationErrorProps {
  message: string;
}

function MobileNavigationError({
  message,
}: MobileNavigationErrorProps) {
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

function MobileNavigationEmpty() {
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
