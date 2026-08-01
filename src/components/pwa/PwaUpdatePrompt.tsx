"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type UpdateState =
  | "idle"
  | "available"
  | "updating"
  | "error";

export default function PwaUpdatePrompt() {
  const [
    updateState,
    setUpdateState,
  ] = useState<UpdateState>("idle");

  const registrationRef =
    useRef<ServiceWorkerRegistration | null>(
      null,
    );

  const hasRequestedUpdateRef =
    useRef(false);

  const handleInstallUpdate =
    useCallback(() => {
      const registration =
        registrationRef.current;

      const waitingWorker =
        registration?.waiting;

      if (!waitingWorker) {
        setUpdateState("error");
        return;
      }

      hasRequestedUpdateRef.current =
        true;

      setUpdateState("updating");

      waitingWorker.postMessage({
        type: "SKIP_WAITING",
      });
    }, []);

  const handleDismiss =
    useCallback(() => {
      setUpdateState("idle");
    }, []);

  useEffect(() => {
    if (
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let isMounted = true;

    const markUpdateAsAvailable =
      (
        registration:
          ServiceWorkerRegistration,
      ) => {
        if (!isMounted) {
          return;
        }

        registrationRef.current =
          registration;

        setUpdateState("available");
      };

    const watchInstallingWorker =
      (
        registration:
          ServiceWorkerRegistration,
      ) => {
        const installingWorker =
          registration.installing;

        if (!installingWorker) {
          return;
        }

        const handleStateChange =
          () => {
            if (
              installingWorker.state !==
              "installed"
            ) {
              return;
            }

            if (
              navigator.serviceWorker
                .controller
            ) {
              markUpdateAsAvailable(
                registration,
              );
            }
          };

        installingWorker.addEventListener(
          "statechange",
          handleStateChange,
        );

        return () => {
          installingWorker.removeEventListener(
            "statechange",
            handleStateChange,
          );
        };
      };

    let removeInstallingWorkerListener:
      | (() => void)
      | undefined;

    let currentRegistration:
      | ServiceWorkerRegistration
      | null = null;

    const handleUpdateFound =
      () => {
        if (!currentRegistration) {
          return;
        }

        removeInstallingWorkerListener?.();

        removeInstallingWorkerListener =
          watchInstallingWorker(
            currentRegistration,
          );
      };

    const handleControllerChange =
      () => {
        if (
          !hasRequestedUpdateRef.current
        ) {
          return;
        }

        window.location.reload();
      };

    const initializeUpdateListener =
      async () => {
        try {
          const registration =
            await navigator.serviceWorker.ready;

          if (!isMounted) {
            return;
          }

          currentRegistration =
            registration;

          registrationRef.current =
            registration;

          if (registration.waiting) {
            markUpdateAsAvailable(
              registration,
            );
          }

          registration.addEventListener(
            "updatefound",
            handleUpdateFound,
          );

          await registration.update();
        } catch (error) {
          console.error(
            "No fue posible comprobar actualizaciones de la PWA:",
            error,
          );
        }
      };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    void initializeUpdateListener();

    return () => {
      isMounted = false;

      removeInstallingWorkerListener?.();

      currentRegistration?.removeEventListener(
        "updatefound",
        handleUpdateFound,
      );

      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  if (updateState === "idle") {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-md"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl dark:bg-blue-950"
          >
            ↻
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {updateState === "error"
                ? "No fue posible actualizar"
                : "Actualización disponible"}
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
              {updateState === "updating"
                ? "Estamos instalando la nueva versión de Vivace Suite."
                : updateState ===
                    "error"
                  ? "Recarga la aplicación para intentar instalar la versión más reciente."
                  : "Hay una nueva versión de Vivace Suite lista para instalar."}
            </p>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {updateState ===
                "available" && (
                <button
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={
                    handleDismiss
                  }
                  type="button"
                >
                  Más tarde
                </button>
              )}

              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
                disabled={
                  updateState ===
                  "updating"
                }
                onClick={
                  updateState === "error"
                    ? () =>
                        window.location.reload()
                    : handleInstallUpdate
                }
                type="button"
              >
                {updateState ===
                "updating"
                  ? "Actualizando..."
                  : updateState ===
                      "error"
                    ? "Recargar"
                    : "Actualizar ahora"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}