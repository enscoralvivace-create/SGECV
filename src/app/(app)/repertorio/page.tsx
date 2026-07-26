"use client";

import RepertoireTable from "@/components/repertoire/RepertoireTable";
import Link from "next/link";
import {
  type FormEvent,
  useState,
} from "react";

import RepertoireFormModal from "@/components/repertoire/RepertoireFormModal";

import type {
  RepertoireFormData,
} from "@/types/repertoire";
import Button from "@/components/common/Button";
import { useRepertoire } from "@/hooks/useRepertoire";
import { emptyRepertoireForm } from "@/utils/repertoire";

export default function RepertoirePage() {
     const {
  repertoire,
  loading,
  error,
  refreshRepertoire,
  createItem,
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

  function openCreateForm(): void {
  setForm(emptyRepertoireForm);
  setMessage("");
  setIsFormOpen(true);
}

function closeForm(): void {
  if (isSaving) {
    return;
  }

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

  const wasCreated =
    await createItem(form);

  if (wasCreated) {
    setForm(emptyRepertoireForm);
    setIsFormOpen(false);
    setMessage(
      "Obra guardada correctamente.",
    );
  } else {
    setMessage(
      "No fue posible guardar la obra.",
    );
  }

  setIsSaving(false);
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
                Todavía no hay obras
                registradas
              </h3>

              <p className="mt-2 text-slate-600">
                Agrega la primera obra del
                repertorio del ensamble.
              </p>
            </div>
          )}

        {!loading &&
  !error &&
  repertoire.length > 0 && (
    <RepertoireTable
      repertoire={repertoire}
    />
  )}
      </section>
      {isFormOpen && (
  <RepertoireFormModal
    form={form}
    setForm={setForm}
    editingItem={null}
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