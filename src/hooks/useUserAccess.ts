"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUserAccess,
} from "@/services/userAccessService";

import type {
  AppPermission,
  AppRole,
  UserAccessProfile,
} from "@/types/accessControl";

interface UseUserAccessResult {
  access: UserAccessProfile | null;
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
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const reload =
    useCallback(async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError("");

        const currentAccess =
          await getCurrentUserAccess();

        setAccess(currentAccess);
      } catch (loadError: unknown) {
        console.error(loadError);

        setAccess(null);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No fue posible consultar los permisos del usuario.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

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
    isLoading,
    error,
    reload,
    hasRole,
    hasPermission,
  };
}