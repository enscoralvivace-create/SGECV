"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createTripReceiptSignedUrl,
  deleteTripBudgetReceipt,
  getTripBudgetReceipts,
  type TripBudgetReceipt,
  uploadTripBudgetReceipt,
} from "@/services/tripReceiptService";

interface TripBudgetReceiptsModalProps {
  budgetItemId: string;
  budgetItemDescription: string;
  onClose: () => void;
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
}

function formatFileSize(
  bytes: number,
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  const megabytes = kilobytes / 1024;

  return `${megabytes.toFixed(1)} MB`;
}

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

function getFileTypeLabel(
  mimeType: string,
): string {
  if (mimeType === "application/pdf") {
    return "PDF";
  }

  if (
    mimeType === "application/xml" ||
    mimeType === "text/xml"
  ) {
    return "XML";
  }

  return "Imagen";
}

export default function TripBudgetReceiptsModal({
  budgetItemId,
  budgetItemDescription,
  onClose,
}: TripBudgetReceiptsModalProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [
    receipts,
    setReceipts,
  ] = useState<TripBudgetReceipt[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    openingId,
    setOpeningId,
  ] = useState<string | null>(null);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  async function loadReceipts(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getTripBudgetReceipts(
          budgetItemId,
        );

      setReceipts(data);
    } catch (loadError) {
      setError(
        getErrorMessage(loadError),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReceipts();
  }, [budgetItemId]);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const newReceipt =
        await uploadTripBudgetReceipt(
          budgetItemId,
          file,
        );

      setReceipts(
        (currentReceipts) => [
          newReceipt,
          ...currentReceipts,
        ],
      );
    } catch (uploadError) {
      setError(
        getErrorMessage(uploadError),
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleOpen(
    receipt: TripBudgetReceipt,
  ): Promise<void> {
    try {
      setOpeningId(receipt.id);
      setError(null);

      const signedUrl =
        await createTripReceiptSignedUrl(
          receipt.filePath,
        );

      window.open(
        signedUrl,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (openError) {
      setError(
        getErrorMessage(openError),
      );
    } finally {
      setOpeningId(null);
    }
  }

  async function handleDelete(
    receipt: TripBudgetReceipt,
  ): Promise<void> {
    const confirmed = window.confirm(
      `¿Deseas eliminar el comprobante "${receipt.fileName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(receipt.id);
      setError(null);

      await deleteTripBudgetReceipt(
        receipt,
      );

      setReceipts(
        (currentReceipts) =>
          currentReceipts.filter(
            (currentReceipt) =>
              currentReceipt.id !==
              receipt.id,
          ),
      );
    } catch (deleteError) {
      setError(
        getErrorMessage(deleteError),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-receipts-title"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Comprobantes
            </p>

            <h2
              id="trip-receipts-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              {budgetItemDescription}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Archivos PDF, JPG, PNG o XML.
              Máximo 10 MB por archivo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar comprobantes"
          >
            Cerrar
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/70 p-5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.xml,application/pdf,image/jpeg,image/png,application/xml,text/xml"
              className="hidden"
              onChange={(event) => {
                void handleFileChange(
                  event,
                );
              }}
            />

            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-900">
                  Agregar comprobante
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Selecciona una factura,
                  recibo, ticket o evidencia.
                </p>
              </div>

              <button
                type="button"
                disabled={uploading}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading
                  ? "Subiendo..."
                  : "Seleccionar archivo"}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          <section className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900">
                Archivos registrados
              </h3>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                {receipts.length}
              </span>
            </div>

            {loading ? (
              <div className="mt-4 rounded-xl border border-slate-200 px-5 py-8 text-center text-sm text-slate-500">
                Cargando comprobantes...
              </div>
            ) : receipts.length === 0 ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-10 text-center">
                <p className="font-semibold text-slate-700">
                  Todavía no hay comprobantes.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  El primer archivo que subas
                  aparecerá en esta sección.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {receipts.map(
                  (receipt) => (
                    <article
                      key={receipt.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                            {getFileTypeLabel(
                              receipt.mimeType,
                            )}
                          </span>

                          <span className="text-xs text-slate-500">
                            {formatFileSize(
                              receipt.fileSize,
                            )}
                          </span>
                        </div>

                        <p
                          className="mt-2 truncate font-semibold text-slate-900"
                          title={receipt.fileName}
                        >
                          {receipt.fileName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Subido el{" "}
                          {formatDate(
                            receipt.createdAt,
                          )}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          disabled={
                            openingId ===
                            receipt.id
                          }
                          onClick={() => {
                            void handleOpen(
                              receipt,
                            );
                          }}
                          className="font-semibold text-blue-700 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {openingId ===
                          receipt.id
                            ? "Abriendo..."
                            : "Abrir"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            receipt.id
                          }
                          onClick={() => {
                            void handleDelete(
                              receipt,
                            );
                          }}
                          className="font-semibold text-rose-700 transition hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          receipt.id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}