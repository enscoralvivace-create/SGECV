"use client";

import type { RepertoireItem } from "@/types/repertoire";

interface RepertoireDetailModalProps {
  item: RepertoireItem;
  onClose: () => void;
}

function hasContent(
  value: string | null | undefined,
): boolean {
  return Boolean(value?.trim());
}

function openExternalResource(
  value: string | null | undefined,
): void {
  const url = value?.trim();

  if (!url) {
    return;
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}

export default function RepertoireDetailModal({
  item,
  onClose,
}: RepertoireDetailModalProps) {
  const preparationItems = [
  {
    icon: "📄",
    label: "Partitura",
    value: item.score_url,
  },
  {
    icon: "🎧",
    label: "Audio",
    value: item.audio_url,
  },
  {
    icon: "🎥",
    label: "Video",
    value: item.video_url,
  },
  {
    icon: "🌎",
    label: "Traducción",
    value: item.translation,
  },
  {
    icon: "🗣️",
    label: "Pronunciación",
    value: item.pronunciation,
  },
  {
    icon: "📝",
    label: "Notas del director",
    value: item.director_notes,
  },
];

const completed = preparationItems.filter(({ value }) =>
  hasContent(value),
).length;

  const percentage = Math.round(
  (completed / preparationItems.length) * 100,
);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-8 py-6 backdrop-blur">

  <div className="flex items-start justify-between gap-6">

    <div className="min-w-0">

      <div className="mb-3 flex flex-wrap items-center gap-3">

        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
          Detalle de obra
        </span>

        <StatusBadge status={item.status} />

      </div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        {item.title}
      </h2>

      <p className="mt-2 text-base text-slate-600">
        {item.composer ?? "Compositor sin registrar"}
      </p>

    </div>

    <button
      type="button"
      onClick={onClose}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
      aria-label="Cerrar detalle de la obra"
    >
      ✕
    </button>

  </div>

</div>

        <div className="space-y-8 p-8">

          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">

  <div className="flex flex-wrap items-start justify-between gap-4">

    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        Preparación de la obra
      </p>

      <h3 className="mt-2 text-xl font-bold text-slate-900">
        Materiales disponibles
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {completed} de {preparationItems.length} recursos registrados
      </p>
    </div>

    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-100 bg-white shadow-sm">
      <span className="text-lg font-bold text-emerald-700">
        {percentage}%
      </span>
    </div>

  </div>

  <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">

    <div
      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
      style={{
        width: `${percentage}%`,
      }}
    />

  </div>

  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

    {preparationItems.map((resource) => {
      const available = hasContent(resource.value);

      return (
        <div
          key={resource.label}
          className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
            available
              ? "border-emerald-200 bg-white"
              : "border-slate-200 bg-slate-100/80"
          }`}
        >
          <div className="flex items-center gap-3">

            <span
              className="text-xl"
              aria-hidden="true"
            >
              {resource.icon}
            </span>

            <span
              className={`text-sm font-semibold ${
                available
                  ? "text-slate-800"
                  : "text-slate-500"
              }`}
            >
              {resource.label}
            </span>

          </div>

          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              available
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 text-slate-400"
            }`}
            aria-label={
              available
                ? `${resource.label} disponible`
                : `${resource.label} pendiente`
            }
          >
            {available ? "✓" : "—"}
          </span>
        </div>
      );
    })}

  </div>

</section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <InfoCard
              title="Duración"
              value={
                item.duration_minutes
                  ? `${item.duration_minutes} min`
                  : "Sin registrar"
              }
            />

            <InfoCard
              title="Tonalidad"
              value={
                item.key ?? "Sin registrar"
              }
            />

            <InfoCard
              title="Estado"
              value={item.status}
            />

            <InfoCard
              title="Arreglista"
              value={
                item.arranger ?? "Sin registrar"
              }
            />

          </section>

          <section>

  <h3 className="mb-5 text-xl font-bold text-slate-900">
    Recursos de la obra
  </h3>

  <div className="space-y-4">

    {preparationItems.map((resource) => {

      const available = hasContent(resource.value);

      const action =
        resource.label === "Partitura"
          ? () => openExternalResource(item.score_url)
          : resource.label === "Audio"
          ? () => openExternalResource(item.audio_url)
          : resource.label === "Video"
          ? () => openExternalResource(item.video_url)
          : undefined;

      const actionLabel =
        resource.label === "Partitura"
          ? "Abrir"
          : resource.label === "Audio"
          ? "Escuchar"
          : resource.label === "Video"
          ? "Ver"
          : undefined;

      return (
        <div
          key={resource.label}
          className={`rounded-2xl border p-5 transition-all ${
            available
              ? "border-emerald-200 bg-white shadow-sm"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                {resource.icon}
              </div>

              <div>

                <p className="font-semibold text-slate-900">
                  {resource.label}
                </p>

                <p className="text-sm text-slate-500">
                  {available
                    ? "Disponible"
                    : "Pendiente"}
                </p>

              </div>

            </div>

            {action ? (
              <button
                type="button"
                onClick={action}
                disabled={!available}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  available
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                {actionLabel}
              </button>
            ) : (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  available
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {available ? "Disponible" : "Pendiente"}
              </span>
            )}

          </div>

        </div>
      );
    })}

  </div>

</section>

          <ContentSection
            icon="🌎"
            title="Traducción"
            content={item.translation}
            emptyMessage="No se ha registrado una traducción para esta obra."
          />
<ContentSection
  icon="🗣️"
  title="Pronunciación"
  content={item.pronunciation}
  emptyMessage="No se ha registrado una guía de pronunciación para esta obra."
/>
<ContentSection
  icon="📝"
  title="Notas del director"
  content={item.director_notes}
  emptyMessage="El director aún no ha registrado observaciones para esta obra."
/>
        </div>

      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">

      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-lg font-semibold leading-6 text-slate-900">
        {value}
      </p>

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: RepertoireItem["status"];
}) {
  const styles: Record<
    RepertoireItem["status"],
    string
  > = {
    Activo:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    "En estudio":
      "border-amber-200 bg-amber-50 text-amber-700",
    Archivado:
      "border-slate-300 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ContentSection({
  icon,
  title,
  content,
  emptyMessage,
}: {
  icon: string;
  title: string;
  content: string | null | undefined;
  emptyMessage: string;
}) {
  const available = hasContent(content);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="border-b bg-slate-50 px-6 py-5">

  <h3 className="flex items-center gap-3 text-lg font-bold text-slate-900">

    <span
      className="text-xl"
      aria-hidden="true"
    >
      {icon}
    </span>

    {title}

  </h3>

  <p className="mt-2 text-sm text-slate-500">
    {title === "Traducción"
      ? "Texto traducido para facilitar el estudio de la obra."
      : title === "Pronunciación"
      ? "Guía fonética para apoyar la interpretación coral."
      : "Observaciones e indicaciones musicales del director."}
  </p>

</div>

      <div className="p-7">
        {available ? (
          <p className="whitespace-pre-wrap leading-7 text-slate-700">
            {content?.trim()}
          </p>
        ) : (
          <p className="italic text-slate-500">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}