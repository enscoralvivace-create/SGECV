"use client";

import { useEffect } from "react";

import { usePwaDisplayMode } from "@/hooks/usePwaDisplayMode";

const DISPLAY_MODE_CLASSES = [
  "pwa-browser",
  "pwa-standalone",
  "pwa-fullscreen",
  "pwa-minimal-ui",
  "pwa-window-controls-overlay",
] as const;

export default function PwaDisplayModeSync() {
  const {
    displayMode,
    isStandalone,
  } = usePwaDisplayMode();

  useEffect(() => {
    const rootElement =
      document.documentElement;

    rootElement.dataset.pwaDisplayMode =
      displayMode;

    rootElement.dataset.pwaStandalone =
      String(isStandalone);

    rootElement.classList.remove(
      ...DISPLAY_MODE_CLASSES,
    );

    rootElement.classList.add(
      `pwa-${displayMode}`,
    );

    return () => {
      delete rootElement.dataset
        .pwaDisplayMode;

      delete rootElement.dataset
        .pwaStandalone;

      rootElement.classList.remove(
        ...DISPLAY_MODE_CLASSES,
      );
    };
  }, [
    displayMode,
    isStandalone,
  ]);

  return null;
}