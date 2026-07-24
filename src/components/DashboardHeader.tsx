export default function DashboardHeader() {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Ensamble Coral Vivace
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Panel principal
          </h2>
        </div>

        <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          Sesión iniciada como{" "}
          <span className="font-semibold text-slate-900">
            Administrador
          </span>
        </div>
      </div>
    </header>
  );
}