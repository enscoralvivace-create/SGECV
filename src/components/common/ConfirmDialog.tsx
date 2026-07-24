"use client";

import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      maxWidth="md"
      onClose={loading ? () => undefined : onCancel}
    >
      <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="secondary"
          disabled={loading}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>

        <Button
          variant={variant}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}