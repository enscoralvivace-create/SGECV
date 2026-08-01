"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUserProfile,
  type CurrentUserProfile,
} from "@/services/currentUserService";

interface UseCurrentUserProfileResult {
  profile: CurrentUserProfile | null;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export default function useCurrentUserProfile():
UseCurrentUserProfileResult {
  const [
    profile,
    setProfile,
  ] =
    useState<CurrentUserProfile | null>(
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

        const currentProfile =
          await getCurrentUserProfile();

        setProfile(
          currentProfile,
        );
      } catch (
        loadError: unknown
      ) {
        console.error(
          loadError,
        );

        setProfile(null);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No fue posible cargar el perfil del usuario.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    profile,
    isLoading,
    error,
    reload,
  };
}