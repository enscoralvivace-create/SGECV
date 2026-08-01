"use client";

import { useEffect } from "react";

const SERVICE_WORKER_URL = "/sw.js";
const SERVICE_WORKER_SCOPE = "/";
const UPDATE_CHECK_INTERVAL_MS =
  60 * 60 * 1000;

function canUseServiceWorker(): boolean {
  return (
    process.env.NODE_ENV ===
      "production" &&
    "serviceWorker" in navigator
  );
}

async function checkForUpdates(
  registration:
    ServiceWorkerRegistration,
): Promise<void> {
  if (!navigator.onLine) {
    return;
  }

  try {
    await registration.update();
  } catch (error) {
    console.error(
      "No fue posible comprobar actualizaciones del Service Worker:",
      error,
    );
  }
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!canUseServiceWorker()) {
      return;
    }

    let isMounted = true;
    let updateIntervalId:
      | ReturnType<typeof setInterval>
      | undefined;

    let registration:
      | ServiceWorkerRegistration
      | null = null;

    const handleOnline = () => {
      if (!registration) {
        return;
      }

      void checkForUpdates(
        registration,
      );
    };

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState !==
            "visible" ||
          !registration
        ) {
          return;
        }

        void checkForUpdates(
          registration,
        );
      };

    async function registerServiceWorker(): Promise<void> {
      try {
        const currentRegistration =
          await navigator.serviceWorker.register(
            SERVICE_WORKER_URL,
            {
              scope:
                SERVICE_WORKER_SCOPE,
              updateViaCache: "none",
            },
          );

        if (!isMounted) {
          return;
        }

        registration =
          currentRegistration;

        await checkForUpdates(
          currentRegistration,
        );

        updateIntervalId =
          setInterval(() => {
            void checkForUpdates(
              currentRegistration,
            );
          }, UPDATE_CHECK_INTERVAL_MS);
      } catch (error) {
        console.error(
          "No fue posible registrar el Service Worker:",
          error,
        );
      }
    }

    window.addEventListener(
      "online",
      handleOnline,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    void registerServiceWorker();

    return () => {
      isMounted = false;

      if (
        updateIntervalId !==
        undefined
      ) {
        clearInterval(
          updateIntervalId,
        );
      }

      window.removeEventListener(
        "online",
        handleOnline,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, []);

  return null;
}