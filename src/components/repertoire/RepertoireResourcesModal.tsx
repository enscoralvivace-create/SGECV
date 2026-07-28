"use client";

import { useState } from "react";

import type { RepertoireResourcesData } from "@/services/repertoireService";
import type { RepertoireItem } from "@/types/repertoire";

interface RepertoireResourcesModalProps {
  item: RepertoireItem;
  isSaving: boolean;
  onClose: () => void;
  onSave: (
    resources: RepertoireResourcesData,
  ) => Promise<boolean>;
}

export default function RepertoireResourcesModal({
  item,
  isSaving,
  onClose,
  onSave,
}: RepertoireResourcesModalProps) {
  const [resourcesForm, setResourcesForm] =
    useState<RepertoireResourcesData>({
      scoreUrl: item.score_url ?? "",
      audioUrl: item.audio_url ?? "",
      videoUrl: item.video_url ?? "",
      translation: item.translation ?? "",
      pronunciation:
        item.pronunciation ?? "",
      directorNotes:
        item.director_notes ?? "",
    });

  function updateField(
    field: keyof RepertoireResourcesData,
    value: string,
  ): void {
    setResourcesForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSave(): Promise<void> {
    await onSave(resourcesForm);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-sky-700">
              Biblioteca de recursos
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {item.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {item.composer ??
                "Compositor sin especificar"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar"
            className="rounded-lg px-3 py-2 text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Enlaces
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Agrega enlaces externos para
                consultar los materiales de la
                obra.
              </p>
            </div>

            <div>
              <label
                htmlFor="resource-score"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                📄 Partitura
              </label>

              <input
                id="resource-score"
                type="url"
                value={resourcesForm.scoreUrl}
                disabled={isSaving}
                onChange={(event) => {
                  updateField(
                    "scoreUrl",
                    event.target.value,
                  );
                }}
                placeholder="https://drive.google.com/..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="resource-audio"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                🎧 Audio de referencia
              </label>

              <input
                id="resource-audio"
                type="url"
                value={resourcesForm.audioUrl}
                disabled={isSaving}
                onChange={(event) => {
                  updateField(
                    "audioUrl",
                    event.target.value,
                  );
                }}
                placeholder="https://youtube.com/..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="resource-video"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                🎥 Video de referencia
              </label>

              <input
                id="resource-video"
                type="url"
                value={resourcesForm.videoUrl}
                disabled={isSaving}
                onChange={(event) => {
                  updateField(
                    "videoUrl",
                    event.target.value,
                  );
                }}
                placeholder="https://youtube.com/..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </section>

          <div className="border-t border-slate-200" />

          <section className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Material de estudio
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Registra información útil para el
                estudio e interpretación de la
                obra.
              </p>
            </div>

            <div>
              <label
                htmlFor="resource-translation"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                🌎 Traducción
              </label>

              <textarea
                id="resource-translation"
                rows={5}
                value={
                  resourcesForm.translation
                }
                disabled={isSaving}
                onChange={(event) => {
                  updateField(
                    "translation",
                    event.target.value,
                  );
                }}
                placeholder="Escribe la traducción del texto..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="resource-pronunciation"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                🗣️ Pronunciación
              </label>

              <textarea
                id="resource-pronunciation"
                rows={4}
                value={
                  resourcesForm.pronunciation
                }
                disabled={isSaving}
                onChange={(event) => {
                  updateField(
                    "pronunciation",
                    event.target.value,
                  );
                }}
                placeholder="Agrega indicaciones de pronunciación..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="resource-director-notes"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                📝 Notas del director
              </label>

              <textarea
                id="resource-director-notes"
                rows={5}
                value={
                  resourcesForm.directorNotes
                }
                disabled={isSaving}
                onChange={(event) => {
                  updateField(
                    "directorNotes",
                    event.target.value,
                  );
                }}
                placeholder="Agrega indicaciones musicales, interpretativas o de ensayo..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={isSaving}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? "Guardando..."
              : "💾 Guardar recursos"}
          </button>
        </div>
      </div>
    </div>
  );
}