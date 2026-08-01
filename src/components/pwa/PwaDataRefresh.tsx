"use client";

import {
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

import { usePwaLifecycle } from "@/hooks/usePwaLifecycle";

const MINIMUM_REFRESH_INTERVAL_MS =
  15 * 1000;

export default function PwaDataRefresh() {
  const router = useRouter();

  const lastRefreshAtRef =
    useRef(0);

  const refreshApplicationData =
    useCallback(() => {
      const now = Date.now();

      if (
        now -
          lastRefreshAtRef.current <
        MINIMUM_REFRESH_INTERVAL_MS
      ) {
        return;
      }

      lastRefreshAtRef.current = now;

      router.refresh();
    }, [router]);

  usePwaLifecycle({
    onAppResumed:
      refreshApplicationData,
    onConnectionRestored:
      refreshApplicationData,
  });

  return null;
}