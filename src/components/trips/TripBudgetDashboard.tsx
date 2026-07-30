"use client";

interface TripBudgetDashboardProps {
  totalItems: number;
  overBudgetItems: number;
  itemsWithoutReceipts: number;
  documentedItems: number;
}

interface DashboardCardProps {
  title: string;
  value: number;
  subtitle: string;
}

function DashboardCard({
  title,
  value,
  subtitle,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

export default function TripBudgetDashboard({
  totalItems,
  overBudgetItems,
  itemsWithoutReceipts,
  documentedItems,
}: TripBudgetDashboardProps) {
  return (
    <section className="px-6 pt-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Conceptos"
          value={totalItems}
          subtitle="Registrados"
        />

        <DashboardCard
          title="Excedidos"
          value={overBudgetItems}
          subtitle="Fuera del presupuesto"
        />

        <DashboardCard
          title="Sin comprobante"
          value={itemsWithoutReceipts}
          subtitle="Pendientes"
        />

        <DashboardCard
          title="Documentados"
          value={documentedItems}
          subtitle="Con al menos un comprobante"
        />
      </div>
    </section>
  );
}