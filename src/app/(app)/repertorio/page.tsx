"use client";

import Link from "next/link";
import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import Button from "@/components/common/Button";
import RepertoireFormModal from "@/components/repertoire/RepertoireFormModal";
import RepertoireTable from "@/components/repertoire/RepertoireTable";
import { useRepertoire } from "@/hooks/useRepertoire";

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
    repertoire,
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

  const [message, setMessage] =
    useState("");

  const [editingItem, setEditingItem] =
    useState<RepertoireItem | null>(null);

  const [selectedFilter, setSelectedFilter] =
    useState<RepertoireFilter>("Todas");

  const filteredRepertoire = useMemo(() => {
    if (selectedFilter === "Todas") {
      return repertoire;
    }

    return repertoire.filter(
      (item) => item.status === selectedFilter,
    );
  }, [repertoire, selectedFilter]);

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
        item.duration_minutes?.toString() ?? "",
      status: item.status,
      notes: item.notes ?? "",
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

    const isEditing = editingItem !== null;

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

  const wasSuccessful = await changeStatus(
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
    <main className="min-h-screen bg-slate-100">
      <header className="bg-emerald-900 px-6 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-200 transition hover:text-white"
          >
            ← Volver al panel
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Repertorio
          </h1>

          <p className="mt-2 text-emerald-100">
            Administración de las obras del
            Ensamble Coral Vivace.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Lista de obras
            </h2>

            <p className="mt-1 text-slate-600">
              {repertoire.length}{" "}
              {repertoire.length === 1
                ? "obra registrada"
                : "obras registradas"}
              .
            </p>
          </div>

          <Button onClick={openCreateForm}>
            + Nueva obra
          </Button>
        </div>

        {!loading &&
          !error &&
          repertoire.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {repertoireFilters.map(
                (filter) => {
                  const isSelected =
                    selectedFilter === filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(filter);
                      }}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
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
                        ({getFilterCount(filter)})
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          )}

        {message && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
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
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-600 shadow-sm">
            Cargando repertorio...
          </div>
        )}

        {!loading &&
          !error &&
          repertoire.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
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
          filteredRepertoire.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                No hay obras en esta categoría
              </h3>

              <p className="mt-2 text-slate-600">
                No existen obras con el estado
                “{selectedFilter}”.
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
    </main>
  );
}