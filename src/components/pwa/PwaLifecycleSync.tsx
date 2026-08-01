"use client";

import { useEffect } from "react";

export const PWA_APP_RESUMED_EVENT =
  "vivace:pwa-app-resumed";

export const PWA_CONNECTION_RESTORED_EVENT =
  "vivace:pwa-connection-restored";

const MIN_EVENT_INTERVAL_MS =
  1000;

let lastEventAt = 0;

function dispatchWindowEvent(
  eventName: string,
): void {
  const now = Date.now();

  if (
    now - lastEventAt <
    MIN_EVENT_INTERVAL_MS
  ) {
    return;
  }

  lastEventAt = now;

  window.dispatchEvent(
    new CustomEvent(eventName),
  );
}

export default function PwaLifecycleSync() {
  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState !==
          "visible"
        ) {
          return;
        }

        dispatchWindowEvent(
          PWA_APP_RESUMED_EVENT,
        );
      };

    const handlePageShow = (
      event: PageTransitionEvent,
    ) => {
      if (!event.persisted) {
        return;
      }

      dispatchWindowEvent(
        PWA_APP_RESUMED_EVENT,
      );
    };

    const handleOnline = () => {
      dispatchWindowEvent(
        PWA_CONNECTION_RESTORED_EVENT,
      );
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    window.addEventListener(
      "pageshow",
      handlePageShow,
    );

    window.addEventListener(
      "online",
      handleOnline,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow,
      );

      window.removeEventListener(
        "online",
        handleOnline,
      );
    };
  }, []);

  return null;
}