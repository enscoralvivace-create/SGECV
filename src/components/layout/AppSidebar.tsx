"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: "🏠",
  },
  {
    label: "Integrantes",
    href: "/integrantes",
    icon: "👥",
  },
  {
    label: "Ensayos y eventos",
    href: "/eventos",
    icon: "📅",
  },
  {
    label: "Asistencias",
    href: "/asistencias",
    icon: "✅",
  },
  {
    label: "Repertorio",
    href: "/repertorio",
    icon: "🎵",
  },
  {
    label: "Cuotas",
    href: "/cuotas",
    icon: "💵",
  },
  {
    label: "Viajes",
    href: "/viajes",
    icon: "✈️",
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: "📊",
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
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

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
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
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/configuracion"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            pathname.startsWith("/configuracion")
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <span aria-hidden="true" className="text-lg">
            ⚙️
          </span>

          <span>Configuración</span>
        </Link>
      </div>
    </aside>
  );
}