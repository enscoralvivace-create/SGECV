"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import useCurrentUserProfile from "@/hooks/useCurrentUserProfile";

interface PersonalGreetingContextValue {
  greeting: string;
  preferredName: string;
  isLoading: boolean;
}

const PersonalGreetingContext =
  createContext<PersonalGreetingContextValue | null>(null);

export function getGreetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return "Buenos días";
  }

  if (hour >= 12 && hour < 19) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

function getEmailLocalPart(email: string): string {
  return email.split("@", 1)[0]?.trim() ?? "";
}

export default function PersonalGreetingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { profile, isLoading } = useCurrentUserProfile();
  const [greeting, setGreeting] = useState("Hola");

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getGreetingForHour(new Date().getHours()));
    };

    updateGreeting();
    const intervalId = setInterval(updateGreeting, 60 * 1000);
    document.addEventListener("visibilitychange", updateGreeting);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", updateGreeting);
    };
  }, []);

  const preferredName = useMemo(() => {
    const candidates = [
      profile?.alias,
      profile?.fullName,
      profile?.authDisplayName,
      getEmailLocalPart(profile?.authEmail || profile?.email || ""),
      "Integrante",
    ];

    return candidates.find((candidate) => candidate?.trim())?.trim() ?? "Integrante";
  }, [profile]);

  const value = useMemo(
    () => ({ greeting, preferredName, isLoading }),
    [greeting, isLoading, preferredName],
  );

  return (
    <PersonalGreetingContext.Provider value={value}>
      {children}
    </PersonalGreetingContext.Provider>
  );
}

export function usePersonalGreeting(): PersonalGreetingContextValue {
  const context = useContext(PersonalGreetingContext);

  if (!context) {
    throw new Error("usePersonalGreeting debe usarse dentro de PersonalGreetingProvider.");
  }

  return context;
}
