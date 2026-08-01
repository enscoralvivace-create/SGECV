"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";
import RepertoireDetailModal from "@/components/repertoire/RepertoireDetailModal";
import Button from "@/components/common/Button";
import RepertoireFormModal from "@/components/repertoire/RepertoireFormModal";
import RepertoireResourcesModal from "@/components/repertoire/RepertoireResourcesModal";
import RepertoireTable from "@/components/repertoire/RepertoireTable";
import VivacePageHeader from "@/components/ui/VivacePageHeader";

import { useRepertoire } from "@/hooks/useRepertoire";

import {
  updateRepertoireResources,
  type RepertoireResourcesData,
} from "@/services/repertoireService";

import type {
  RepertoireFormData,
  RepertoireItem,
  RepertoireStatus,
} from "@/types/repertoire";

import { emptyRepertoireForm } from "@/utils/repertoire";

type RepertoireFilter =
  | "Todas"
  | RepertoireStatus;

const repertoireFilters: RepertoireFilter[] = [
  "Todas",
  "Activo",
  "En estudio",
  "Archivado",
];

export default function RepertoirePage() {
  const {
  repertoire = [],
  loading,
  error,
  refreshRepertoire,
  createItem,
  updateItem,
  changeStatus,
} = useRepertoire();

  const [form, setForm] =
    useState<RepertoireFormData>(
      emptyRepertoireForm,
    );

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    isSavingResources,
    setIsSavingResources,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [editingItem, setEditingItem] =
    useState<RepertoireItem | null>(null);

  const [resourcesItem, setResourcesItem] =
    useState<RepertoireItem | null>(null);

  const [detailItem, setDetailItem] =
  useState<RepertoireItem | null>(null);

  const [selectedFilter, setSelectedFilter] =
    useState<RepertoireFilter>("Todas");

  const [searchTerm, setSearchTerm] =
    useState("");

  const filteredRepertoire = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return repertoire.filter((item) => {
      const matchesStatus =
        selectedFilter === "Todas" ||
        item.status === selectedFilter;

      const searchableText = [
        item.title,
        item.composer ?? "",
        item.arranger ?? "",
        item.key ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        searchableText.includes(
          normalizedSearch,
        );

      return matchesStatus && matchesSearch;
    });
  }, [
    repertoire,
    selectedFilter,
    searchTerm,
  ]);

  function openResources(
    item: RepertoireItem,
  ): void {
    setMessage("");
    setResourcesItem(item);
  }

  function openDetail(
  item: RepertoireItem,
): void {
  setDetailItem(item);
}

function closeDetail(): void {
  setDetailItem(null);
}
  function closeResources(): void {
    if (isSavingResources) {
      return;
    }

    setResourcesItem(null);
  }

  async function handleSaveResources(
    resources: RepertoireResourcesData,
  ): Promise<boolean> {
    if (!resourcesItem) {
      setMessage(
        "No se encontró la obra seleccionada.",
      );

      return false;
    }

    setIsSavingResources(true);
    setMessage("");

    try {
      await updateRepertoireResources(
        resourcesItem.id,
        resources,
      );

      await refreshRepertoire();

      setResourcesItem(null);

      setMessage(
        "Recursos guardados correctamente.",
      );

      return true;
    } catch (saveError) {
      const errorMessage =
        saveError instanceof Error
          ? saveError.message
          : "No fue posible guardar los recursos.";

      setMessage(errorMessage);

      return false;
    } finally {
      setIsSavingResources(false);
    }
  }

  function getFilterCount(
    filter: RepertoireFilter,
  ): number {
    if (filter === "Todas") {
      return repertoire.length;
    }

    return repertoire.filter(
      (item) => item.status === filter,
    ).length;
  }

  function openCreateForm(): void {
    setEditingItem(null);
    setForm(emptyRepertoireForm);
    setMessage("");
    setIsFormOpen(true);
  }

  function openEditForm(
    item: RepertoireItem,
  ): void {
    setEditingItem(item);

    setForm({
      title: item.title,
      composer: item.composer ?? "",
      arranger: item.arranger ?? "",
      key: item.key ?? "",
      durationMinutes:
        item.duration_minutes?.toString() ??
        "",
      status: item.status,
      notes: item.notes ?? "",
      scoreUrl: item.score_url ?? "",
      audioUrl: item.audio_url ?? "",
      videoUrl: item.video_url ?? "",
      translation: item.translation ?? "",
      pronunciation:
        item.pronunciation ?? "",
      directorNotes:
        item.director_notes ?? "",
    });

    setMessage("");
    setIsFormOpen(true);
  }

  function closeForm(): void {
    if (isSaving) {
      return;
    }

    setEditingItem(null);
    setForm(emptyRepertoireForm);
    setIsFormOpen(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage(
        "Escribe el título de la obra.",
      );

      return;
    }

    if (
      form.durationMinutes.trim() &&
      Number(form.durationMinutes) < 0
    ) {
      setMessage(
        "La duración no puede ser negativa.",
      );

      return;
    }

    setIsSaving(true);
    setMessage("");

    const isEditing =
      editingItem !== null;

    let wasSuccessful = false;

    if (editingItem) {
      wasSuccessful = await updateItem(
        editingItem.id,
        form,
      );
    } else {
      wasSuccessful =
        await createItem(form);
    }

    if (wasSuccessful) {
      setForm(emptyRepertoireForm);
      setEditingItem(null);
      setIsFormOpen(false);

      setMessage(
        isEditing
          ? "Obra actualizada correctamente."
          : "Obra guardada correctamente.",
      );
    } else {
      setMessage(
        isEditing
          ? "No fue posible actualizar la obra."
          : "No fue posible guardar la obra.",
      );
    }

    setIsSaving(false);
  }

  async function handleArchive(
    item: RepertoireItem,
  ): Promise<void> {
    const confirmed = window.confirm(
      `¿Deseas archivar la obra "${item.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    const wasSuccessful =
      await changeStatus(
        item.id,
        "Archivado",
      );

    setMessage(
      wasSuccessful
        ? "Obra archivada correctamente."
        : "No fue posible archivar la obra.",
    );
  }

  async function handleReactivate(
    item: RepertoireItem,
  ): Promise<void> {
    const confirmed = window.confirm(
      `¿Deseas reactivar la obra "${item.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    const wasSuccessful =
      await changeStatus(
        item.id,
        "Activo",
      );

    setMessage(
      wasSuccessful
        ? "Obra reactivada correctamente."
        : "No fue posible reactivar la obra.",
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <section className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Biblioteca coral"
          title="Repertorio"
          description="Administra obras, estados, materiales de estudio y recursos musicales del Ensamble Coral Vivace."
          actions={
            <Button onClick={openCreateForm}>
              + Nueva obra
            </Button>
          }
        />

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:rounded-3xl sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Lista de obras
            </h2>

            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              {repertoire.length}{" "}
              {repertoire.length === 1
                ? "obra registrada"
                : "obras registradas"}
              .
            </p>
          </div>

          
        </div>

        {!loading &&
          !error &&
          repertoire.length > 0 && (
            <div className="mb-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:rounded-3xl sm:p-6">
              <div>
                <label
                  htmlFor="repertoire-search"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Buscar obra
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    🔍
                  </span>

                  <input
                    id="repertoire-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(
                        event.target.value,
                      );
                    }}
                    placeholder="Buscar por título, compositor, arreglista o tonalidad"
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {repertoireFilters.map(
                  (filter) => {
                    const isSelected =
                      selectedFilter ===
                      filter;

                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => {
                          setSelectedFilter(
                            filter,
                          );
                        }}
                        className={`min-h-10 shrink-0 snap-start rounded-xl border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                          isSelected
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-emerald-600 hover:text-emerald-700"
                        }`}
                      >
                        {filter}{" "}
                        <span
                          className={
                            isSelected
                              ? "text-emerald-100"
                              : "text-slate-500"
                          }
                        >
                          (
                          {getFilterCount(
                            filter,
                          )}
                          )
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}

        {message && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4 text-sm font-medium text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 sm:px-5 sm:py-4 text-sm font-medium text-red-700">
            <p>
              No fue posible cargar el
              repertorio: {error}
            </p>

            <button
              type="button"
              onClick={() => {
                void refreshRepertoire();
              }}
              className="mt-3 font-semibold underline underline-offset-4"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 sm:rounded-3xl sm:px-6 text-center text-slate-600 shadow-sm">
            Cargando repertorio...
          </div>
        )}

        {!loading &&
          !error &&
          repertoire.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 sm:rounded-3xl sm:px-6 sm:py-14 text-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Todavía no hay obras registradas
              </h3>

              <p className="mt-2 text-slate-600">
                Agrega la primera obra del
                repertorio del ensamble.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          repertoire.length > 0 &&
          filteredRepertoire.length ===
            0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 sm:rounded-3xl sm:px-6 sm:py-14 text-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                No se encontraron obras
              </h3>

              <p className="mt-2 text-slate-600">
                No hay resultados para la
                búsqueda o el filtro
                seleccionado.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredRepertoire.length > 0 && (
           <RepertoireTable
  repertoire={filteredRepertoire}
  onEdit={openEditForm}
  onArchive={handleArchive}
  onReactivate={handleReactivate}
  onResources={openResources}
  onDetail={openDetail}
/>
          )}
      </section>

      {isFormOpen && (
        <RepertoireFormModal
          form={form}
          setForm={setForm}
          editingItem={editingItem}
          isSaving={isSaving}
          onClose={closeForm}
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        />
      )}

      {resourcesItem && (
        <RepertoireResourcesModal
          item={resourcesItem}
          isSaving={isSavingResources}
          onClose={closeResources}
          onSave={handleSaveResources}
        />
      )}
      {detailItem && (
  <RepertoireDetailModal
    item={detailItem}
    onClose={closeDetail}
  />
)}
    </main>
  );
}