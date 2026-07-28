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
  const resources = [
    item.score_url,
    item.audio_url,
    item.video_url,
    item.translation,
    item.pronunciation,
    item.director_notes,
  ];

  const completed = resources.filter(hasContent).length;

  const percentage = Math.round(
    (completed / resources.length) * 100,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-8 py-6">

          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {item.title}
            </h2>

            <p className="mt-2 text-slate-600">
              {item.composer ?? "Compositor sin registrar"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 transition hover:bg-slate-100"
            aria-label="Cerrar detalle de la obra"
          >
            ✕
          </button>

        </div>

        <div className="space-y-8 p-8">

          <section>

            <div className="mb-2 flex justify-between">

              <span className="font-semibold">
                Recursos
              </span>

              <span>
                {completed} / {resources.length}
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

            <p className="mt-2 text-sm text-slate-500">
              {percentage}% completado
            </p>

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

            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Recursos disponibles
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              <ResourceRow
                icon="📄"
                title="Partitura"
                available={hasContent(item.score_url)}
                actionLabel="Abrir"
                onAction={() =>
                  openExternalResource(item.score_url)
                }
              />

              <ResourceRow
                icon="🎧"
                title="Audio"
                available={hasContent(item.audio_url)}
                actionLabel="Escuchar"
                onAction={() =>
                  openExternalResource(item.audio_url)
                }
              />

              <ResourceRow
                icon="🎥"
                title="Video"
                available={hasContent(item.video_url)}
                actionLabel="Ver"
                onAction={() =>
                  openExternalResource(item.video_url)
                }
              />

              <ResourceRow
                icon="🌎"
                title="Traducción"
                available={hasContent(item.translation)}
              />

              <ResourceRow
                icon="🗣️"
                title="Pronunciación"
                available={hasContent(item.pronunciation)}
              />

              <ResourceRow
                icon="📝"
                title="Notas del director"
                available={hasContent(item.director_notes)}
              />

            </div>

          </section>

          <ContentSection
            icon="🌎"
            title="Traducción"
            content={item.translation}
            emptyMessage="No se ha registrado una traducción para esta obra."
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
    <div className="rounded-xl border bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-2 font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ResourceRow({
  icon,
  title,
  available,
  actionLabel,
  onAction,
}: {
  icon: string;
  title: string;
  available: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
        available
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-100"
      }`}
    >
      <span className="font-medium text-slate-800">
        {icon} {title}
      </span>

      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          disabled={!available}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            available
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          {actionLabel}
        </button>
      ) : (
        <span
          className="text-lg"
          aria-label={
            available
              ? `${title} disponible`
              : `${title} no disponible`
          }
        >
          {available ? "✅" : "❌"}
        </span>
      )}
    </div>
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
      <div className="border-b bg-slate-50 px-6 py-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span aria-hidden="true">
            {icon}
          </span>

          {title}
        </h3>
      </div>

      <div className="p-6">
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