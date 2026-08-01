"use client";

import {
  Download,
  Share2,
  Smartphone,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import VivaceButton from "@/components/ui/VivaceButton";
import VivaceCard from "@/components/ui/VivaceCard";

interface BeforeInstallPromptEvent
  extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome:
      | "accepted"
      | "dismissed";
    platform: string;
  }>;
}

const DISMISSED_STORAGE_KEY =
  "vivace-pwa-install-dismissed";

function isStandaloneMode(): boolean {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  const navigatorWithStandalone =
    window.navigator as Navigator & {
      standalone?: boolean;
    };

  return (
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches ||
    navigatorWithStandalone.standalone ===
      true
  );
}

function isIosDevice(): boolean {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  return /iphone|ipad|ipod/i.test(
    window.navigator.userAgent,
  );
}

export default function PwaInstallPrompt() {
  const [
    installEvent,
    setInstallEvent,
  ] =
    useState<BeforeInstallPromptEvent | null>(
      null,
    );

  const [
    isVisible,
    setIsVisible,
  ] = useState(false);

  const [
    isInstalling,
    setIsInstalling,
  ] = useState(false);

  const isIos =
    useMemo(
      () => isIosDevice(),
      [],
    );

  useEffect(() => {
    if (
      isStandaloneMode()
    ) {
      return;
    }

    const wasDismissed =
      window.localStorage.getItem(
        DISMISSED_STORAGE_KEY,
      ) === "true";

    if (
      wasDismissed
    ) {
      return;
    }

    if (isIos) {
      setIsVisible(true);
    }

    function handleBeforeInstallPrompt(
      event: Event,
    ): void {
      event.preventDefault();

      setInstallEvent(
        event as BeforeInstallPromptEvent,
      );

      setIsVisible(true);
    }

    function handleAppInstalled(): void {
      setInstallEvent(null);
      setIsVisible(false);

      window.localStorage.removeItem(
        DISMISSED_STORAGE_KEY,
      );
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled,
      );
    };
  }, [isIos]);

  function handleDismiss(): void {
    window.localStorage.setItem(
      DISMISSED_STORAGE_KEY,
      "true",
    );

    setIsVisible(false);
  }

  async function handleInstall(): Promise<void> {
    if (!installEvent) {
      return;
    }

    try {
      setIsInstalling(true);

      await installEvent.prompt();

      const choice =
        await installEvent.userChoice;

      if (
        choice.outcome ===
        "accepted"
      ) {
        setIsVisible(false);
      }
    } finally {
      setIsInstalling(false);
      setInstallEvent(null);
    }
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0">
      <VivaceCard className="overflow-hidden border-emerald-200 shadow-xl">
        <VivaceCard.Body className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 text-white">
              <Smartphone className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                    Aplicación móvil
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    Instala Vivace Suite
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    handleDismiss
                  }
                  aria-label="Cerrar invitación"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isIos ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    En Safari, toca Compartir y después selecciona “Agregar a pantalla de inicio”.
                  </p>

                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <Share2 className="h-4 w-4 text-emerald-800" />

                    Compartir → Agregar a pantalla de inicio
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Agrega Vivace Suite a tu teléfono para abrirla como una aplicación.
                  </p>

                  <VivaceButton
                    className="mt-4"
                    size="sm"
                    loading={
                      isInstalling
                    }
                    leftIcon={
                      <Download className="h-4 w-4" />
                    }
                    onClick={() => {
                      void handleInstall();
                    }}
                  >
                    Instalar aplicación
                  </VivaceButton>
                </>
              )}
            </div>
          </div>
        </VivaceCard.Body>
      </VivaceCard>
    </div>
  );
}