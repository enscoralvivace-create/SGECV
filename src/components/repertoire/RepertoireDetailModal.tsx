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
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b px-8 py-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {item.title}
            </h2>

            <p className="mt-2 text-slate-600">
              {item.composer ?? "Compositor sin registrar"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 hover:bg-slate-100"
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
                className="h-full rounded-full bg-emerald-600"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {percentage}% completado
            </p>
          </section>

          <section className="grid grid-cols-2 gap-4">

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
                item.arranger ??
                "Sin registrar"
              }
            />

          </section>

          <section>

            <h3 className="mb-4 text-lg font-bold">
              Recursos disponibles
            </h3>

            <div className="grid grid-cols-2 gap-3">

              <ResourceRow
                icon="📄"
                title="Partitura"
                available={hasContent(item.score_url)}
              />

              <ResourceRow
                icon="🎧"
                title="Audio"
                available={hasContent(item.audio_url)}
              />

              <ResourceRow
                icon="🎥"
                title="Video"
                available={hasContent(item.video_url)}
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
      <p className="text-xs uppercase text-slate-500">
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
}: {
  icon: string;
  title: string;
  available: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-4 ${
        available
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-100"
      }`}
    >
      <span>
        {icon} {title}
      </span>

      <span>
        {available ? "✅" : "❌"}
      </span>
    </div>
  );
}