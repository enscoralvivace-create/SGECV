"use client";

import {
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

interface PwaConnectionStatusProps {
  className?: string;
}

export default function PwaConnectionStatus({
  className = "",
}: PwaConnectionStatusProps) {
  const [
    isOnline,
    setIsOnline,
  ] = useState(true);

  const [
    showRestoredMessage,
    setShowRestoredMessage,
  ] = useState(false);

  useEffect(() => {
    setIsOnline(
      navigator.onLine,
    );

    function handleOffline(): void {
      setIsOnline(false);
      setShowRestoredMessage(false);
    }

    function handleOnline(): void {
      setIsOnline(true);
      setShowRestoredMessage(true);
    }

    window.addEventListener(
      "offline",
      handleOffline,
    );

    window.addEventListener(
      "online",
      handleOnline,
    );

    return () => {
      window.removeEventListener(
        "offline",
        handleOffline,
      );

      window.removeEventListener(
        "online",
        handleOnline,
      );
    };
  }, []);

  useEffect(() => {
    if (!showRestoredMessage) {
      return;
    }

    const timeoutId =
      window.setTimeout(
        () => {
          setShowRestoredMessage(false);
        },
        4500,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [showRestoredMessage]);

  if (
    isOnline &&
    !showRestoredMessage
  ) {
    return null;
  }

  const isRestored =
    isOnline &&
    showRestoredMessage;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed inset-x-4 top-20 z-[100] mx-auto max-w-md lg:left-auto lg:right-6 lg:top-6 lg:mx-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur",
          isRestored
            ? "border-emerald-200 bg-emerald-50/95 text-emerald-950"
            : "border-amber-200 bg-amber-50/95 text-amber-950",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isRestored
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800",
          ].join(" ")}
        >
          {isRestored ? (
            <Wifi className="h-5 w-5" />
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold">
            {isRestored
              ? "Conexión restablecida"
              : "Sin conexión a internet"}
          </p>

          <p className="mt-1 text-sm leading-5 opacity-80">
            {isRestored
              ? "Vivace Suite ya puede volver a consultar y guardar información."
              : "Algunas funciones no estarán disponibles hasta recuperar la conexión."}
          </p>
        </div>

        {isRestored ? (
          <button
            type="button"
            onClick={() => {
              setShowRestoredMessage(false);
            }}
            aria-label="Cerrar aviso"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}