"use client";

import {
  MessageSquareText,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import VivaceBadge from "@/components/ui/VivaceBadge";
import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";
import VivaceLoading from "@/components/ui/VivaceLoading";
import VivaceModal from "@/components/ui/VivaceModal";
import {
  getPilotFeedback,
  getPilotFeedbackSummary,
} from "@/services/pilotFeedbackService";
import {
  PILOT_FEEDBACK_CATEGORIES,
  PILOT_FEEDBACK_CATEGORY_LABELS,
  type PilotFeedbackCategory,
  type PilotFeedbackEntry,
  type PilotFeedbackSummary,
} from "@/types/pilotFeedback";

const EMPTY_SUMMARY: PilotFeedbackSummary = {
  total: 0,
  error: 0,
  suggestion: 0,
  question: 0,
  praise: 0,
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PilotFeedbackAdminPanel() {
  const [category, setCategory] =
    useState<PilotFeedbackCategory | "">("");
  const [entries, setEntries] = useState<PilotFeedbackEntry[]>([]);
  const [summary, setSummary] =
    useState<PilotFeedbackSummary>(EMPTY_SUMMARY);
  const [selected, setSelected] = useState<PilotFeedbackEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [nextEntries, nextSummary] = await Promise.all([
        getPilotFeedback(category || null),
        getPilotFeedbackSummary(),
      ]);
      setEntries(nextEntries);
      setSummary(nextSummary);
    } catch (loadError: unknown) {
      console.error(loadError);
      setError("No fue posible consultar la retroalimentación del piloto.");
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="mt-6" aria-labelledby="pilot-feedback-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
            Piloto
          </p>
          <h2 id="pilot-feedback-title" className="mt-1 text-2xl font-bold text-slate-950">
            Retroalimentación
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Revisa los comentarios más recientes enviados desde Mi cuenta.
          </p>
        </div>
        <VivaceButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => void load()}
          disabled={isLoading}
        >
          Actualizar
        </VivaceButton>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {([
          ["Total", summary.total],
          ["Errores", summary.error],
          ["Sugerencias", summary.suggestion],
          ["Dudas", summary.question],
          ["Me gustó", summary.praise],
        ] as const).map(([label, value]) => (
          <VivaceCard key={label} padding="sm">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
          </VivaceCard>
        ))}
      </div>

      <VivaceCard>
        <VivaceCard.Header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-bold text-slate-950">Comentarios recientes</h3>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            Categoría
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as PilotFeedbackCategory | "")}
              className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Todas</option>
              {PILOT_FEEDBACK_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {PILOT_FEEDBACK_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
        </VivaceCard.Header>

        <VivaceCard.Body>
          {isLoading ? (
            <VivaceLoading message="Cargando comentarios..." />
          ) : error ? (
            <div role="alert" className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <TriangleAlert className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center text-slate-600">
              <MessageSquareText className="mx-auto h-9 w-9 text-slate-400" />
              <p className="mt-3 text-sm">Todavía no hay comentarios en esta categoría.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelected(entry)}
                  className="flex w-full flex-col gap-2 py-4 text-left transition first:pt-0 last:pb-0 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 sm:flex-row sm:items-center sm:justify-between sm:rounded-lg sm:px-2"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-950">{entry.memberName}</span>
                      <VivaceBadge tone="neutral">
                        {PILOT_FEEDBACK_CATEGORY_LABELS[entry.category]}
                      </VivaceBadge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                      {entry.message}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-slate-500" dateTime={entry.createdAt}>
                    {formatDate(entry.createdAt)}
                  </time>
                </button>
              ))}
            </div>
          )}
        </VivaceCard.Body>
      </VivaceCard>

      <VivaceModal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title="Detalle del comentario"
        size="md"
      >
        {selected ? (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-slate-950">{selected.memberName}</strong>
              <VivaceBadge tone="neutral">
                {PILOT_FEEDBACK_CATEGORY_LABELS[selected.category]}
              </VivaceBadge>
              <time className="text-slate-500" dateTime={selected.createdAt}>
                {formatDate(selected.createdAt)}
              </time>
            </div>
            <p className="whitespace-pre-wrap break-words leading-7 text-slate-800">
              {selected.message}
            </p>
            <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div><dt className="font-semibold text-slate-600">Página</dt><dd className="mt-1 break-all text-slate-900">{selected.pagePath ?? "No disponible"}</dd></div>
              <div><dt className="font-semibold text-slate-600">Versión</dt><dd className="mt-1 text-slate-900">{selected.appVersion ?? "No disponible"}</dd></div>
              <div className="sm:col-span-2"><dt className="font-semibold text-slate-600">Dispositivo/navegador</dt><dd className="mt-1 break-words text-slate-900">{selected.userAgent ?? "No disponible"}</dd></div>
            </dl>
          </div>
        ) : null}
      </VivaceModal>
    </section>
  );
}
