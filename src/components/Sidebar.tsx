import Link from "next/link";

type SidebarProps = {
  userEmail?: string;
  onLogout: () => void;
};

const menuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: "⌂",
  },
  {
    name: "Integrantes",
    href: "/integrantes",
    icon: "👥",
  },
  {
    name: "Asistencias",
    href: "#",
    icon: "✓",
  },
  {
    name: "Ensayos y eventos",
    href: "#",
    icon: "📅",
  },
  {
    name: "Repertorio",
    href: "#",
    icon: "♫",
  },
  {
    name: "Cuotas",
    href: "#",
    icon: "$",
  },
  {
    name: "Reportes",
    href: "#",
    icon: "▥",
  },
];

export default function Sidebar({
  userEmail,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="relative bg-slate-950 text-white lg:min-h-screen lg:w-72">
      <div className="border-b border-white/10 px-6 py-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-800 text-2xl">
            ♪
          </div>

          <div>
            <h1 className="text-xl font-bold">Vivace Suite</h1>

            <p className="mt-1 text-xs text-slate-400">
              Administración Coral
            </p>
          </div>
        </div>
      </div>

      <nav className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 lg:block lg:space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              item.href === "/"
                ? "bg-emerald-800 text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4 lg:absolute lg:bottom-0 lg:w-72">
        <p className="truncate px-3 text-xs text-slate-400">
          {userEmail}
        </p>

        <button
          type="button"
          onClick={onLogout}
          className="mt-3 w-full rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}