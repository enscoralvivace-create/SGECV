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

interface ResourceLinkProps {
  title: string;
  url: string | null | undefined;
  buttonText: string;
}

interface ResourceTextProps {
  title: string;
  text: string | null | undefined;
}

function ResourceLink({
  title,
  url,
  buttonText,
}: ResourceLinkProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="font-semibold text-slate-800">
        {title}
      </h4>

      {url?.trim() ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          {buttonText}
        </a>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          Sin recurso disponible.
        </p>
      )}
    </div>
  );
}

function ResourceText({
  title,
  text,
}: ResourceTextProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="font-semibold text-slate-800">
        {title}
      </h4>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {text?.trim() || "Sin información."}
      </p>
    </div>
  );
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

  const [isEditing, setIsEditing] =
    useState(false);

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
    const saved =
      await onSave(resourcesForm);

    if (saved) {
      setIsEditing(false);
    }
  }

  function handleCancelEditing(): void {
    setResourcesForm({
      scoreUrl: item.score_url ?? "",
      audioUrl: item.audio_url ?? "",
      videoUrl: item.video_url ?? "",
      translation: item.translation ?? "",
      pronunciation:
        item.pronunciation ?? "",
      directorNotes:
        item.director_notes ?? "",
    });

    setIsEditing(false);
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

        {!isEditing && (
          <div className="space-y-6 px-6 py-6">
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Recursos disponibles
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Consulta los materiales asociados
                  con esta obra.
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ResourceLink
                  title="📄 Partitura"
                  url={resourcesForm.scoreUrl}
                  buttonText="Abrir partitura"
                />

                <ResourceLink
                  title="🎧 Audio"
                  url={resourcesForm.audioUrl}
                  buttonText="Escuchar audio"
                />

                <ResourceLink
                  title="🎥 Video"
                  url={resourcesForm.videoUrl}
                  buttonText="Ver video"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Material de estudio
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Información para el estudio y la
                  interpretación de la obra.
                </p>
              </div>

              <ResourceText
                title="🌎 Traducción"
                text={resourcesForm.translation}
              />

              <ResourceText
                title="🗣️ Pronunciación"
                text={resourcesForm.pronunciation}
              />

              <ResourceText
                title="📝 Notas del director"
                text={resourcesForm.directorNotes}
              />
            </section>
          </div>
        )}

        {isEditing && (
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
                  value={resourcesForm.translation}
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
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          {!isEditing && (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                }}
                className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                ✏️ Editar recursos
              </button>
            </>
          )}

          {isEditing && (
            <>
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={isSaving}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar edición
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}