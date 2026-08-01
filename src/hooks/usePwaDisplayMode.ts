"use client";

import {
  useEffect,
  useState,
} from "react";

export type PwaDisplayMode =
  | "browser"
  | "standalone"
  | "fullscreen"
  | "minimal-ui"
  | "window-controls-overlay";

interface NavigatorWithStandalone
  extends Navigator {
  standalone?: boolean;
}

function getDisplayMode(): PwaDisplayMode {
  if (
    window.matchMedia(
      "(display-mode: window-controls-overlay)",
    ).matches
  ) {
    return "window-controls-overlay";
  }

  if (
    window.matchMedia(
      "(display-mode: fullscreen)",
    ).matches
  ) {
    return "fullscreen";
  }

  if (
    window.matchMedia(
      "(display-mode: minimal-ui)",
    ).matches
  ) {
    return "minimal-ui";
  }

  const navigatorWithStandalone =
    navigator as NavigatorWithStandalone;

  if (
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches ||
    navigatorWithStandalone.standalone ===
      true
  ) {
    return "standalone";
  }

  return "browser";
}

export function usePwaDisplayMode() {
  const [
    displayMode,
    setDisplayMode,
  ] = useState<PwaDisplayMode>(
    "browser",
  );

  useEffect(() => {
    const mediaQueries = [
      window.matchMedia(
        "(display-mode: standalone)",
      ),
      window.matchMedia(
        "(display-mode: fullscreen)",
      ),
      window.matchMedia(
        "(display-mode: minimal-ui)",
      ),
      window.matchMedia(
        "(display-mode: window-controls-overlay)",
      ),
    ];

    const updateDisplayMode = () => {
      setDisplayMode(
        getDisplayMode(),
      );
    };

    updateDisplayMode();

    mediaQueries.forEach(
      (mediaQuery) => {
        mediaQuery.addEventListener(
          "change",
          updateDisplayMode,
        );
      },
    );

    return () => {
      mediaQueries.forEach(
        (mediaQuery) => {
          mediaQuery.removeEventListener(
            "change",
            updateDisplayMode,
          );
        },
      );
    };
  }, []);

  return {
    displayMode,
    isStandalone:
      displayMode !== "browser",
  };
}