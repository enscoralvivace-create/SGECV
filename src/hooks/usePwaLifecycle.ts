"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  PWA_APP_RESUMED_EVENT,
  PWA_CONNECTION_RESTORED_EVENT,
} from "@/components/pwa/PwaLifecycleSync";

interface UsePwaLifecycleOptions {
  onAppResumed?: () => void;
  onConnectionRestored?: () => void;
}

export function usePwaLifecycle({
  onAppResumed,
  onConnectionRestored,
}: UsePwaLifecycleOptions): void {
  const onAppResumedRef =
    useRef(onAppResumed);

  const onConnectionRestoredRef =
    useRef(onConnectionRestored);

  useEffect(() => {
    onAppResumedRef.current =
      onAppResumed;
  }, [onAppResumed]);

  useEffect(() => {
    onConnectionRestoredRef.current =
      onConnectionRestored;
  }, [onConnectionRestored]);

  useEffect(() => {
    const handleAppResumed = () => {
      onAppResumedRef.current?.();
    };

    const handleConnectionRestored =
      () => {
        onConnectionRestoredRef.current?.();
      };

    window.addEventListener(
      PWA_APP_RESUMED_EVENT,
      handleAppResumed,
    );

    window.addEventListener(
      PWA_CONNECTION_RESTORED_EVENT,
      handleConnectionRestored,
    );

    return () => {
      window.removeEventListener(
        PWA_APP_RESUMED_EVENT,
        handleAppResumed,
      );

      window.removeEventListener(
        PWA_CONNECTION_RESTORED_EVENT,
        handleConnectionRestored,
      );
    };
  }, []);
}