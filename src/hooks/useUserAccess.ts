"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getCurrentUserAccess,
} from "@/services/userAccessService";

import { supabase } from "@/lib/supabase";

import type {
  AppPermission,
  AppRole,
  UserAccessProfile,
} from "@/types/accessControl";

interface UseUserAccessResult {
  access: UserAccessProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  hasPermission: (
    permission: AppPermission,
  ) => boolean;
}

export default function useUserAccess(): UseUserAccessResult {
  const [
    access,
    setAccess,
  ] =
    useState<UserAccessProfile | null>(
      null,
    );

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const reloadPromiseRef =
    useRef<Promise<void> | null>(
      null,
    );

  const reloadTimeoutRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const mountedRef =
    useRef(false);

  const authRevisionRef =
    useRef(0);

  const reload =
    useCallback((): Promise<void> => {
      if (reloadPromiseRef.current) {
        return reloadPromiseRef.current;
      }

      const reloadPromise =
        (async (): Promise<void> => {
          const authRevision =
            authRevisionRef.current;

          try {
            if (mountedRef.current) {
              setIsLoading(true);
              setError("");
            }

            const {
              data: {
                session,
              },
              error: sessionError,
            } =
              await supabase.auth.getSession();

            if (sessionError) {
              throw sessionError;
            }

            if (!session) {
              if (
                mountedRef.current &&
                authRevision === authRevisionRef.current
              ) {
                setAccess(null);
                setIsAuthenticated(false);
              }

              return;
            }

            if (
              mountedRef.current &&
              authRevision === authRevisionRef.current
            ) {
              setIsAuthenticated(true);
            }

            const currentAccess =
              await getCurrentUserAccess();

            if (
              mountedRef.current &&
              authRevision === authRevisionRef.current
            ) {
              setAccess(currentAccess);
            }
          } catch (loadError: unknown) {
            console.error(loadError);

            if (
              mountedRef.current &&
              authRevision === authRevisionRef.current
            ) {
              setAccess(null);

              setError(
                loadError instanceof Error
                  ? loadError.message
                  : "No fue posible consultar los permisos del usuario.",
              );
            }
          } finally {
            if (mountedRef.current) {
              setIsLoading(false);
            }
          }
        })().finally(() => {
          if (
            reloadPromiseRef.current ===
              reloadPromise
          ) {
            reloadPromiseRef.current = null;
          }
        });

      reloadPromiseRef.current =
        reloadPromise;

      return reloadPromise;
    }, []);

  const scheduleReload =
    useCallback((): void => {
      if (reloadTimeoutRef.current) {
        clearTimeout(
          reloadTimeoutRef.current,
        );
      }

      reloadTimeoutRef.current =
        setTimeout(() => {
          reloadTimeoutRef.current =
            null;

          void reload();
        }, 0);
    }, [reload]);

  useEffect(() => {
    mountedRef.current = true;

    void reload();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (event) => {
          if (!mountedRef.current) {
            return;
          }

          if (
            event === "SIGNED_OUT"
          ) {
            authRevisionRef.current += 1;

            if (
              reloadTimeoutRef.current
            ) {
              clearTimeout(
                reloadTimeoutRef.current,
              );

              reloadTimeoutRef.current =
                null;
            }

            setAccess(null);
            setIsAuthenticated(false);
            setError("");
            setIsLoading(false);
            return;
          }

          scheduleReload();
        },
      );

    return () => {
      mountedRef.current = false;

      if (reloadTimeoutRef.current) {
        clearTimeout(
          reloadTimeoutRef.current,
        );

        reloadTimeoutRef.current =
          null;
      }

      subscription.unsubscribe();
    };
  }, [reload, scheduleReload]);

  const hasRole =
    useCallback(
      (role: AppRole): boolean =>
        access?.roles.includes(
          role,
        ) ?? false,
      [access],
    );

  const hasPermission =
    useCallback(
      (
        permission: AppPermission,
      ): boolean =>
        access?.permissions.includes(
          permission,
        ) ?? false,
      [access],
    );

  return {
    access,
    isAuthenticated,
    isLoading,
    error,
    reload,
    hasRole,
    hasPermission,
  };
}
