"use client";

import { CheckCircle2, Send, TriangleAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import packageJson from "../../../package.json";

import VivaceButton from "@/components/ui/VivaceButton";
import VivaceModal from "@/components/ui/VivaceModal";
import { submitPilotFeedback } from "@/services/pilotFeedbackService";
import {
  PILOT_FEEDBACK_CATEGORIES,
  PILOT_FEEDBACK_CATEGORY_LABELS,
  type PilotFeedbackCategory,
} from "@/types/pilotFeedback";

interface PilotFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PilotFeedbackModal({
  isOpen,
  onClose,
}: PilotFeedbackModalProps) {
  const pathname = usePathname();
  const categoryId = useId();
  const messageId = useId();
  const [category, setCategory] =
    useState<PilotFeedbackCategory | "">("");
  const [message, setMessage] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  function resetAndClose(): void {
    setCategory("");
    setMessage("");
    setCategoryError("");
    setMessageError("");
    setSubmitError("");
    setIsSent(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedMessage = message.trim();
    const nextCategoryError = category
      ? ""
      : "Selecciona una categoría.";
    const nextMessageError =
      normalizedMessage.length < 10
        ? "Escribe al menos 10 caracteres."
        : normalizedMessage.length > 2000
          ? "El comentario no puede superar 2000 caracteres."
          : "";

    setCategoryError(nextCategoryError);
    setMessageError(nextMessageError);
    setSubmitError("");

    if (nextCategoryError || nextMessageError || !category) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitPilotFeedback({
        category,
        message: normalizedMessage,
        pagePath: pathname,
        appVersion: packageJson.version,
        userAgent: window.navigator.userAgent,
      });
      setIsSent(true);
    } catch (error: unknown) {
      console.error(error);
      setSubmitError(
        "No fue posible enviar tu comentario. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <VivaceModal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Enviar comentario"
      description="Tu experiencia nos ayuda a preparar una mejor versión de Vivace Suite."
      size="md"
      closeOnBackdrop={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      {isSent ? (
        <div className="py-4 text-center" role="status">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" />
          <h3 className="mt-4 text-lg font-bold text-slate-950">
            Comentario enviado
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            ¡Muchas gracias! Tu comentario quedó registrado.
          </p>
          <VivaceButton className="mt-5" onClick={resetAndClose}>
            Cerrar
          </VivaceButton>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <label htmlFor={categoryId} className="block text-sm font-semibold text-slate-700">
              Categoría
            </label>
            <select
              id={categoryId}
              autoFocus
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as PilotFeedbackCategory | "");
                setCategoryError("");
              }}
              aria-invalid={categoryError ? true : undefined}
              aria-describedby={categoryError ? `${categoryId}-error` : undefined}
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
            >
              <option value="">Selecciona una opción</option>
              {PILOT_FEEDBACK_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {PILOT_FEEDBACK_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
            {categoryError ? (
              <p id={`${categoryId}-error`} role="alert" className="text-xs font-medium text-rose-600">
                {categoryError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <label htmlFor={messageId} className="text-sm font-semibold text-slate-700">
                Comentario
              </label>
              <span className="text-xs text-slate-500">{message.length}/2000</span>
            </div>
            <textarea
              id={messageId}
              value={message}
              maxLength={2000}
              rows={7}
              onChange={(event) => {
                setMessage(event.target.value);
                setMessageError("");
              }}
              placeholder="Cuéntanos qué ocurrió, qué mejorarías o qué te gustó."
              aria-invalid={messageError ? true : undefined}
              aria-describedby={messageError ? `${messageId}-error` : undefined}
              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 sm:text-sm"
            />
            {messageError ? (
              <p id={`${messageId}-error`} role="alert" className="text-xs font-medium text-rose-600">
                {messageError}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <VivaceButton variant="ghost" onClick={resetAndClose} disabled={isSubmitting}>
              Cancelar
            </VivaceButton>
            <VivaceButton type="submit" loading={isSubmitting} leftIcon={<Send className="h-4 w-4" />}>
              Enviar comentario
            </VivaceButton>
          </div>
        </form>
      )}
    </VivaceModal>
  );
}
