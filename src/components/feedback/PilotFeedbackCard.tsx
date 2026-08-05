"use client";

import { MessageSquareText } from "lucide-react";
import { useState } from "react";

import PilotFeedbackModal from "@/components/feedback/PilotFeedbackModal";
import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";

export default function PilotFeedbackCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <VivaceCard className="mb-4 border-sky-200 sm:mb-6">
        <VivaceCard.Body className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h2 className="font-bold text-slate-950">
              Ayúdanos a mejorar Vivace Suite
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Estás utilizando la versión piloto. Tus comentarios nos ayudarán a mejorar la aplicación.
            </p>
          </div>

          <VivaceButton
            variant="outline"
            leftIcon={<MessageSquareText className="h-4 w-4" />}
            onClick={() => setIsOpen(true)}
            className="shrink-0"
          >
            Enviar comentario
          </VivaceButton>
        </VivaceCard.Body>
      </VivaceCard>

      <PilotFeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
