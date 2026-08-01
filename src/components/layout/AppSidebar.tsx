"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  mobileLabel: string;
  href: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    mobileLabel: "Inicio",
    href: "/",
    icon: "🏠",
  },
  {
    label: "Integrantes",
    mobileLabel: "Integrantes",
    href: "/integrantes",
    icon: "👥",
  },
  {
    label: "Ensayos y eventos",
    mobileLabel: "Eventos",
    href: "/eventos",
    icon: "📅",
  },
  {
    label: "Asistencias",
    mobileLabel: "Asistencia",
    href: "/asistencias",
    icon: "✅",
  },
  {
    label: "Repertorio",
    mobileLabel: "Repertorio",
    href: "/repertorio",
    icon: "🎵",
  },
  {
    label: "Cuotas",
    mobileLabel: "Cuotas",
    href: "/cuotas",
    icon: "💵",
  },
  {
    label: "Viajes",
    mobileLabel: "Viajes",
    href: "/viajes",
    icon: "✈️",
  },
  {
    label: "Reportes",
    mobileLabel: "Reportes",
    href: "/reportes",
    icon: "📊",
  },
];

function isNavigationItemActive(
  pathname: string,
  href: string,
): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Ensamble Coral Vivace
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Vivace Suite
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestión coral
          </p>
        </div>

        <nav
          aria-label="Navegación principal"
          className="flex-1 space-y-1 px-4 py-6"
        >
          {navigationItems.map(
            (item) => {
              const isActive =
                isNavigationItemActive(
                  pathname,
                  item.href,
                );

              return (
                <Link
                  key={item.href}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  href={item.href}
                >
                  <span
                    aria-hidden="true"
                    className="text-lg"
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            },
          )}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <Link
            aria-current={
              pathname.startsWith(
                "/configuracion",
              )
                ? "page"
                : undefined
            }
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              pathname.startsWith(
                "/configuracion",
              )
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            href="/configuracion"
          >
            <span
              aria-hidden="true"
              className="text-lg"
            >
              ⚙️
            </span>

            <span>Configuración</span>
          </Link>
        </div>
      </aside>

      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[var(--safe-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
      >
        <div className="flex overflow-x-auto overscroll-x-contain px-[var(--safe-left)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navigationItems.map(
            (item) => {
              const isActive =
                isNavigationItemActive(
                  pathname,
                  item.href,
                );

              return (
                <Link
                  key={item.href}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  className={`flex min-h-16 min-w-[76px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-center transition active:scale-95 ${
                    isActive
                      ? "text-indigo-700"
                      : "text-slate-500"
                  }`}
                  href={item.href}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-12 items-center justify-center rounded-full text-lg transition ${
                      isActive
                        ? "bg-indigo-100"
                        : "bg-transparent"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="max-w-[72px] truncate text-[10px] font-semibold leading-none">
                    {item.mobileLabel}
                  </span>
                </Link>
              );
            },
          )}

          <Link
            aria-current={
              pathname.startsWith(
                "/configuracion",
              )
                ? "page"
                : undefined
            }
            className={`flex min-h-16 min-w-[76px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-center transition active:scale-95 ${
              pathname.startsWith(
                "/configuracion",
              )
                ? "text-indigo-700"
                : "text-slate-500"
            }`}
            href="/configuracion"
          >
            <span
              aria-hidden="true"
              className={`flex h-8 w-12 items-center justify-center rounded-full text-lg transition ${
                pathname.startsWith(
                  "/configuracion",
                )
                  ? "bg-indigo-100"
                  : "bg-transparent"
              }`}
            >
              ⚙️
            </span>

            <span className="max-w-[72px] truncate text-[10px] font-semibold leading-none">
              Ajustes
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}