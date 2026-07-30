"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createTripReceiptSignedUrl,
  type TripBudgetReceipt,
} from "@/services/tripReceiptService";

interface TripBudgetReceiptPreviewModalProps {
  receipt: TripBudgetReceipt;
  onClose: () => void;
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible mostrar el comprobante.";
}

function isImage(
  mimeType: string,
): boolean {
  return mimeType.startsWith("image/");
}

function isPdf(
  mimeType: string,
): boolean {
  return mimeType === "application/pdf";
}

function isXml(
  mimeType: string,
): boolean {
  return (
    mimeType === "application/xml" ||
    mimeType === "text/xml"
  );
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

export default function TripBudgetReceiptPreviewModal({
  receipt,
  onClose,
}: TripBudgetReceiptPreviewModalProps) {
  const [
    signedUrl,
    setSignedUrl,
  ] = useState<string | null>(null);

  const [
    xmlContent,
    setXmlContent,
  ] = useState<string | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPreview(): Promise<void> {
      try {
        setLoading(true);
        setError(null);
        setSignedUrl(null);
        setXmlContent(null);

        const url =
          await createTripReceiptSignedUrl(
            receipt.filePath,
          );

        if (!isActive) {
          return;
        }

        setSignedUrl(url);

        if (isXml(receipt.mimeType)) {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(
              "No fue posible leer el contenido XML.",
            );
          }

          const content =
            await response.text();

          if (!isActive) {
            return;
          }

          setXmlContent(content);
        }
      } catch (previewError) {
        if (isActive) {
          setError(
            getErrorMessage(
              previewError,
            ),
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      isActive = false;
    };
  }, [receipt]);

  function handleOpenNewTab(): void {
    if (!signedUrl) {
      return;
    }

    window.open(
      signedUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-preview-title"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
              Vista previa
            </p>

            <h2
              id="receipt-preview-title"
              className="mt-1 truncate text-xl font-bold text-slate-900"
              title={receipt.fileName}
            >
              {receipt.fileName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatFileSize(
                receipt.fileSize,
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!signedUrl}
              onClick={handleOpenNewTab}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Abrir en otra pestaña
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Cerrar
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-100 p-4 sm:p-6">
          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white">
              <p className="text-sm font-medium text-slate-500">
                Cargando vista previa...
              </p>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex min-h-[420px] items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-6 text-center"
            >
              <div>
                <p className="font-semibold text-rose-700">
                  No fue posible mostrar el archivo.
                </p>

                <p className="mt-2 text-sm text-rose-600">
                  {error}
                </p>
              </div>
            </div>
          ) : isImage(receipt.mimeType) &&
            signedUrl ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white p-4">
              <img
                src={signedUrl}
                alt={`Comprobante ${receipt.fileName}`}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          ) : isPdf(receipt.mimeType) &&
            signedUrl ? (
            <iframe
              src={signedUrl}
              title={`Vista previa de ${receipt.fileName}`}
              className="h-[70vh] min-h-[520px] w-full rounded-xl border border-slate-300 bg-white"
            />
          ) : isXml(receipt.mimeType) &&
            xmlContent !== null ? (
            <pre className="min-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-950 p-5 text-sm leading-6 text-slate-100">
              {xmlContent}
            </pre>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center">
              <div>
                <p className="font-semibold text-slate-700">
                  Este archivo no tiene una vista previa disponible.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Puedes abrirlo en otra pestaña para consultarlo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}