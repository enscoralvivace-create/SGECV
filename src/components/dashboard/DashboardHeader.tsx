"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  LogOut,
  TriangleAlert,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  getCurrentUserProfile,
  type CurrentUserProfile,
} from "@/services/currentUserService";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";

  return "Buenas noches";
}

function formatCurrentDate(): string {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function getRoleLabel(role: string): string {
  switch (role.toLowerCase()) {
    case "admin":
      return "Administrador";

    case "member":
      return "Integrante";

    default:
      return role;
  }
}

export default function DashboardHeader() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<CurrentUserProfile | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoadingProfile(true);
      setErrorMessage(null);

      try {
        const currentProfile =
          await getCurrentUserProfile();

        if (isMounted) {
          setProfile(currentProfile);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No fue posible cargar el perfil.",
          );
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? `No fue posible cerrar la sesión: ${error.message}`
          : "No fue posible cerrar la sesión.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className="mb-8">
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-700">
            {loadingProfile ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              profile?.initials ?? "VS"
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Vivace Suite
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
              {getGreeting()}
              {profile?.name
                ? `, ${profile.name}`
                : ""}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="capitalize">
                {formatCurrentDate()}
              </span>

              {profile && (
                <>
                  <span aria-hidden="true">•</span>

                  <span>
                    {getRoleLabel(profile.role)}
                  </span>

                  {profile.voice && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span>{profile.voice}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSigningOut ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}

          {isSigningOut
            ? "Cerrando sesión..."
            : "Cerrar sesión"}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <p className="text-sm font-medium text-amber-800">
              {errorMessage}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}