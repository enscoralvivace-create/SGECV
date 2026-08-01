"use client";

import { useEffect } from "react";

export const PWA_APP_RESUMED_EVENT =
  "vivace:pwa-app-resumed";

export const PWA_CONNECTION_RESTORED_EVENT =
  "vivace:pwa-connection-restored";

function dispatchWindowEvent(
  eventName: string,
): void {
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