"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPermissionAdminMembers,
  getPermissionOverrides,
  removePermissionOverride,
  setPermissionOverride,
  type PermissionAdminMember,
  type PermissionOverrideRecord,
} from "@/services/permissionAdminService";

import type {
  AppPermission,
} from "@/types/accessControl";

interface UsePermissionAdminResult {
  members: PermissionAdminMember[];
  overrides: PermissionOverrideRecord[];
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  reload: () => Promise<void>;
  setOverride: (
    authUserId: string,
    permission: AppPermission,
    isGranted: boolean,
  ) => Promise<void>;
  removeOverride: (
    authUserId: string,
    permission: AppPermission,
  ) => Promise<void>;
}

export default function usePermissionAdmin(): UsePermissionAdminResult {
  const [
    members,
    setMembers,
  ] = useState<
    PermissionAdminMember[]
  >([]);

  const [
    overrides,
    setOverrides,
  ] = useState<
    PermissionOverrideRecord[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    savingKeys,
    setSavingKeys,
  ] = useState<
    Set<string>
  >(new Set());

  const [
    error,
    setError,
  ] = useState("");

  const reload =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setError("");

        const [
          loadedMembers,
          loadedOverrides,
        ] =
          await Promise.all([
            getPermissionAdminMembers(),
            getPermissionOverrides(),
          ]);

        setMembers(
          loadedMembers,
        );

        setOverrides(
          loadedOverrides,
        );
      } catch (
        loadError: unknown
      ) {
        console.error(
          loadError,
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No fue posible cargar los permisos.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setOverride =
    useCallback(
      async (
        authUserId: string,
        permission: AppPermission,
        isGranted: boolean,
      ) => {
        const key =
          `${authUserId}:${permission}`;

        setSavingKeys(
          (current) =>
            new Set(
              current,
            ).add(key),
        );

        setError("");

        try {
          await setPermissionOverride(
            authUserId,
            permission,
            isGranted,
          );

          await reload();
        } catch (
          saveError: unknown
        ) {
          console.error(
            saveError,
          );

          setError(
            saveError instanceof Error
              ? saveError.message
              : "No fue posible guardar el permiso.",
          );

          throw saveError;
        } finally {
          setSavingKeys(
            (current) => {
              const next =
                new Set(
                  current,
                );

              next.delete(key);

              return next;
            },
          );
        }
      },
      [reload],
    );

  const removeOverride =
    useCallback(
      async (
        authUserId: string,
        permission: AppPermission,
      ) => {
        const key =
          `${authUserId}:${permission}`;

        setSavingKeys(
          (current) =>
            new Set(
              current,
            ).add(key),
        );

        setError("");

        try {
          await removePermissionOverride(
            authUserId,
            permission,
          );

          await reload();
        } catch (
          saveError: unknown
        ) {
          console.error(
            saveError,
          );

          setError(
            saveError instanceof Error
              ? saveError.message
              : "No fue posible restaurar el permiso heredado.",
          );

          throw saveError;
        } finally {
          setSavingKeys(
            (current) => {
              const next =
                new Set(
                  current,
                );

              next.delete(key);

              return next;
            },
          );
        }
      },
      [reload],
    );

  const isSaving =
    useMemo(
      () =>
        savingKeys.size > 0,
      [savingKeys],
    );

  return {
    members,
    overrides,
    isLoading,
    isSaving,
    error,
    reload,
    setOverride,
    removeOverride,
  };
}
