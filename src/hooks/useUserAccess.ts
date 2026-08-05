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

  const hasResolvedRef =
    useRef(false);

  const authenticatedUserIdRef =
    useRef<string | null>(null);

  const reload =
    useCallback((): Promise<void> => {
      if (reloadPromiseRef.current) {
        return reloadPromiseRef.current;
      }

      const reloadPromise =
        (async (): Promise<void> => {
          const authRevision =
            authRevisionRef.current;
          const isInitialResolution =
            !hasResolvedRef.current;
          let didResolve = false;

          try {
            if (mountedRef.current) {
              if (isInitialResolution) {
                setIsLoading(true);
              }

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
                authenticatedUserIdRef.current = null;
                didResolve = true;
              }

              return;
            }

            if (
              mountedRef.current &&
              authRevision === authRevisionRef.current
            ) {
              setIsAuthenticated(true);
              authenticatedUserIdRef.current =
                session.user.id;
            }

            const currentAccess =
              await getCurrentUserAccess();

            if (
              mountedRef.current &&
              authRevision === authRevisionRef.current
            ) {
              setAccess(currentAccess);
              didResolve = true;
            }
          } catch (loadError: unknown) {
            console.error(loadError);

            if (
              mountedRef.current &&
              authRevision === authRevisionRef.current
            ) {
              if (isInitialResolution) {
                setAccess(null);

                setError(
                  loadError instanceof Error
                    ? loadError.message
                    : "No fue posible consultar los permisos del usuario.",
                );
              }
            }
          } finally {
            if (
              mountedRef.current &&
              authRevision === authRevisionRef.current
            ) {
              if (didResolve) {
                hasResolvedRef.current = true;
              }

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
        (event, session) => {
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
            hasResolvedRef.current = true;
            authenticatedUserIdRef.current = null;
            return;
          }

          const nextUserId =
            session?.user.id ?? null;

          if (
            hasResolvedRef.current &&
            nextUserId &&
            authenticatedUserIdRef.current &&
            nextUserId !== authenticatedUserIdRef.current
          ) {
            authRevisionRef.current += 1;
            reloadPromiseRef.current = null;
            hasResolvedRef.current = false;
            authenticatedUserIdRef.current = nextUserId;
            setAccess(null);
            setIsAuthenticated(true);
            setError("");
            setIsLoading(true);
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
