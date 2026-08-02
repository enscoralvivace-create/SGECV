"use client";

import {
  ArrowLeft,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";

import { useRouter } from "next/navigation";

import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";

interface AccessDeniedProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showReloadButton?: boolean;
  onReload?: () => void;
  className?: string;
}

export default function AccessDenied({
  title = "Acceso restringido",
  description =
    "No tienes permisos para acceder a este módulo. Si consideras que se trata de un error, contacta a un administrador.",
  showBackButton = true,
  showReloadButton = false,
  onReload,
  className = "",
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div
      className={[
        "flex min-h-[55dvh] items-center justify-center px-4 py-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <VivaceCard className="w-full max-w-xl border-amber-200 bg-amber-50/70">
        <VivaceCard.Body className="p-6 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <LockKeyhole
              aria-hidden="true"
              className="h-7 w-7"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {showBackButton ? (
              <VivaceButton
                variant="outline"
                leftIcon={
                  <ArrowLeft className="h-4 w-4" />
                }
                onClick={() => {
                  router.back();
                }}
              >
                Volver
              </VivaceButton>
            ) : null}

            {showReloadButton ? (
              <VivaceButton
                variant="primary"
                leftIcon={
                  <RefreshCw className="h-4 w-4" />
                }
                onClick={onReload}
              >
                Revisar permisos
              </VivaceButton>
            ) : null}
          </div>
        </VivaceCard.Body>
      </VivaceCard>
    </div>
  );
}
