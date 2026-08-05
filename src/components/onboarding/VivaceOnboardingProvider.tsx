"use client";

import {
  createContext,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import VivaceButton from "@/components/ui/VivaceButton";
import useUserAccess from "@/hooks/useUserAccess";
import type { AppPermission, AppRole } from "@/types/accessControl";

const ONBOARDING_STORAGE_KEY = "vivace:onboarding:v1";

function getOnboardingStorageKey(authUserId: string): string {
  return `${ONBOARDING_STORAGE_KEY}:${authUserId}`;
}

function hasCompletedOnboarding(authUserId: string): boolean {
  try {
    return (
      window.localStorage.getItem(getOnboardingStorageKey(authUserId)) ===
      "complete"
    );
  } catch {
    return false;
  }
}

function markOnboardingComplete(authUserId: string | null): void {
  if (!authUserId) {
    return;
  }

  try {
    window.localStorage.setItem(
      getOnboardingStorageKey(authUserId),
      "complete",
    );
  } catch {
    // El recorrido sigue siendo utilizable aunque el navegador bloquee storage.
  }
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targets?: string[];
  targetRequired?: boolean;
  permissions?: AppPermission[];
}

const PERSONAL_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido a Vivace Suite!",
    description:
      "Consulta tu repertorio, registra tu asistencia y revisa tu estado de cuenta desde un solo lugar.",
  },
  {
    id: "repertoire",
    title: "Repertorio",
    description:
      "Consulta partituras, audios, videos, traducciones, pronunciaciones y notas del director.",
    targets: ["repertoire"],
    permissions: ["repertoire.view", "repertoire.manage"],
  },
  {
    id: "fees",
    title: "Mi estado de cuenta",
    description:
      "Consulta tus cargos, pagos, saldo pendiente e historial.",
    targets: ["fees"],
    permissions: ["fees.viewOwn"],
  },
  {
    id: "attendance",
    title: "Asistencia",
    description:
      "Cuando exista un ensayo disponible, aquí encontrarás las opciones relacionadas con tu asistencia y tu código QR.",
    targets: ["attendance", "dashboard"],
    permissions: ["attendance.viewOwn"],
  },
  {
    id: "account",
    title: "Mi cuenta",
    description:
      "Consulta tus datos personales y administra tu sesión.",
    targets: ["my-account"],
    permissions: ["dashboard.view"],
  },
  {
    id: "complete",
    title: "¡Todo listo!",
    description:
      "Ya conoces las funciones principales de Vivace Suite.",
  },
];

const TEACHER_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido a Vivace Suite!",
    description:
      "Consulta tus ensayos, asistencias y materiales de repertorio desde un solo lugar.",
  },
  {
    id: "events",
    title: "Ensayos y eventos",
    description: "Consulta la agenda de ensayos y eventos disponibles.",
    targets: ["events"],
    permissions: ["events.view", "events.manage"],
  },
  {
    id: "attendance",
    title: "Asistencias",
    description: "Consulta y gestiona las opciones de asistencia disponibles para tu cuenta.",
    targets: ["attendance", "dashboard"],
    permissions: ["attendance.viewOwn", "attendance.viewAll", "attendance.manage"],
  },
  {
    id: "repertoire",
    title: "Repertorio",
    description: "Consulta los materiales y recursos disponibles para preparar las obras.",
    targets: ["repertoire"],
    permissions: ["repertoire.view", "repertoire.manage"],
  },
  {
    id: "fees",
    title: "Mi estado de cuenta",
    description: "Consulta tus cargos, pagos, saldo pendiente e historial.",
    targets: ["fees"],
    permissions: ["fees.viewOwn"],
  },
  {
    id: "account",
    title: "Mi cuenta",
    description: "Consulta tus datos personales y administra tu sesión.",
    targets: ["my-account"],
    permissions: ["dashboard.view"],
  },
  {
    id: "complete",
    title: "¡Todo listo!",
    description: "Ya conoces las funciones principales de Vivace Suite.",
  },
];

const ADMIN_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido a Vivace Suite!",
    description:
      "Administra integrantes, ensayos, asistencias, repertorio, cuotas, viajes y reportes del Ensamble Coral Vivace.",
  },
  {
    id: "members",
    title: "Integrantes",
    description: "Consulta y administra la información de los integrantes del ensamble.",
    targets: ["members"],
    permissions: ["members.view", "members.manage"],
  },
  {
    id: "events",
    title: "Ensayos y eventos",
    description: "Organiza y consulta los ensayos y eventos del ensamble.",
    targets: ["events"],
    permissions: ["events.view", "events.manage"],
  },
  {
    id: "attendance",
    title: "Asistencias",
    description: "Consulta y administra el registro de asistencia del ensamble.",
    targets: ["attendance"],
    permissions: ["attendance.viewAll", "attendance.manage"],
  },
  {
    id: "repertoire",
    title: "Repertorio",
    description: "Administra las obras y sus materiales de estudio.",
    targets: ["repertoire"],
    permissions: ["repertoire.view", "repertoire.manage"],
  },
  {
    id: "fees",
    title: "Cuotas",
    description: "Consulta y administra cargos, pagos y saldos del ensamble.",
    targets: ["fees"],
    permissions: ["fees.viewAll", "fees.manage"],
  },
  {
    id: "trips",
    title: "Viajes",
    description: "Consulta y administra la organización de viajes del ensamble.",
    targets: ["trips"],
    permissions: ["trips.viewAll", "trips.manage"],
  },
  {
    id: "reports",
    title: "Reportes",
    description: "Consulta reportes para dar seguimiento a la gestión coral.",
    targets: ["reports"],
    permissions: ["reports.view"],
  },
  {
    id: "settings",
    title: "Configuración",
    description: "Administra los roles y permisos de acceso a Vivace Suite.",
    targets: ["settings"],
    permissions: ["settings.manage", "roles.manage"],
  },
  {
    id: "complete",
    title: "¡Todo listo!",
    description:
      "Ya conoces las herramientas de gestión. Desde Mi cuenta puedes consultar tus datos y administrar tu sesión.",
    targets: ["my-account"],
    targetRequired: false,
  },
];

interface OnboardingContextValue {
  startOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function isVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    styles.display !== "none" &&
    styles.visibility !== "hidden"
  );
}

function findVisibleTarget(targets: string[] | undefined): HTMLElement | null {
  if (!targets) {
    return null;
  }

  for (const target of targets) {
    const candidates = document.querySelectorAll<HTMLElement>(
      `[data-onboarding-target="${target}"]`,
    );
    const visibleCandidate = Array.from(candidates).find(isVisible);

    if (visibleCandidate) {
      return visibleCandidate;
    }
  }

  return null;
}

function hasAnyPermission(
  permissions: AppPermission[],
  required: AppPermission[] | undefined,
): boolean {
  return !required || required.some((permission) => permissions.includes(permission));
}

function hasAdministrativeBreadth(
  permissions: AppPermission[],
  roles: AppRole[],
): boolean {
  const administrativeScopes: AppPermission[][] = [
    ["members.view", "members.manage"],
    ["events.manage"],
    ["attendance.viewAll", "attendance.manage"],
    ["repertoire.manage"],
    ["fees.viewAll", "fees.manage"],
    ["trips.viewAll", "trips.manage"],
    ["reports.view"],
    ["settings.manage", "roles.manage"],
  ];

  const scopeCount = administrativeScopes.filter((scope) =>
    scope.some((permission) => permissions.includes(permission)),
  ).length;

  return scopeCount >= (roles.includes("teacher") ? 2 : 1);
}

function getStepCatalog(
  permissions: AppPermission[],
  roles: AppRole[],
): OnboardingStep[] {
  if (hasAdministrativeBreadth(permissions, roles)) {
    return ADMIN_STEPS;
  }

  if (roles.includes("teacher")) {
    return TEACHER_STEPS;
  }

  return PERSONAL_STEPS;
}

function getAvailableSteps(
  catalog: OnboardingStep[],
  permissions: AppPermission[],
): OnboardingStep[] {
  return catalog.filter((step) => {
    if (!hasAnyPermission(permissions, step.permissions)) {
      return false;
    }

    return (
      !step.targets ||
      step.targetRequired === false ||
      Boolean(findVisibleTarget(step.targets))
    );
  });
}

export function useVivaceOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useVivaceOnboarding debe utilizarse dentro de VivaceOnboardingProvider.");
  }

  return context;
}

export default function VivaceOnboardingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { access, isLoading: isLoadingAccess } = useUserAccess();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const permissionKey = [...(access?.permissions ?? [])].sort().join("|");
  const roleKey = [...(access?.roles ?? [])].sort().join("|");
  const isAccessActive = access?.isActive ?? false;
  const authUserId = access?.authUserId ?? null;

  const permissions = useMemo(
    () =>
      permissionKey
        ? (permissionKey.split("|") as AppPermission[])
        : [],
    [permissionKey],
  );
  const roles = useMemo(
    () => (roleKey ? (roleKey.split("|") as AppRole[]) : []),
    [roleKey],
  );

  const stepCatalog = useMemo(
    () => getStepCatalog(permissions, roles),
    [permissions, roles],
  );

  const startOnboarding = useCallback(() => {
    const availableSteps = getAvailableSteps(stepCatalog, permissions);
    setSteps(availableSteps);
    setCurrentIndex(0);
    setIsOpen(availableSteps.length > 0);
  }, [permissions, stepCatalog]);

  useEffect(() => {
    if (
      !isLoadingAccess &&
      isAccessActive &&
      authUserId &&
      !hasCompletedOnboarding(authUserId)
    ) {
      let hasStarted = false;
      const tryStart = () => {
        if (hasStarted || !findVisibleTarget(["dashboard"])) {
          return;
        }

        hasStarted = true;
        observer.disconnect();
        window.clearTimeout(fallbackTimeout);
        startOnboarding();
      };
      const observer = new MutationObserver(tryStart);
      const fallbackTimeout = window.setTimeout(() => {
        if (!hasStarted) {
          hasStarted = true;
          observer.disconnect();
          startOnboarding();
        }
      }, 3000);

      observer.observe(document.body, { childList: true, subtree: true });
      tryStart();

      return () => {
        observer.disconnect();
        window.clearTimeout(fallbackTimeout);
      };
    }
  }, [authUserId, isAccessActive, isLoadingAccess, startOnboarding]);

  const contextValue = useMemo(
    () => ({ startOnboarding }),
    [startOnboarding],
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      {isOpen && steps[currentIndex] ? (
        <OnboardingOverlay
          steps={steps}
          currentIndex={currentIndex}
          onBack={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          onNext={() => {
            if (currentIndex >= steps.length - 1) {
              markOnboardingComplete(authUserId);
              setIsOpen(false);
              return;
            }

            setCurrentIndex((index) => index + 1);
          }}
          onSkip={() => {
            markOnboardingComplete(authUserId);
            setIsOpen(false);
          }}
        />
      ) : null}
    </OnboardingContext.Provider>
  );
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function OnboardingOverlay({
  steps,
  currentIndex,
  onBack,
  onNext,
  onSkip,
}: {
  steps: OnboardingStep[];
  currentIndex: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const step = steps[currentIndex];
  const dialogRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    const updateTarget = () => {
      const target = findVisibleTarget(step.targets);

      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      const padding = 6;
      setTargetRect({
        top: Math.max(4, rect.top - padding),
        left: Math.max(4, rect.left - padding),
        width: Math.min(window.innerWidth - 8, rect.width + padding * 2),
        height: rect.height + padding * 2,
      });
    };

    updateTarget();
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);

    return () => {
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [step]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    document.body.style.overflow = "hidden";
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onSkip();
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>("button:not([disabled])"),
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onSkip, step]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;
  const cardStyle = getCardPosition(targetRect);

  return createPortal(
    <div className="fixed inset-0 z-[100]" aria-live="polite">
      {targetRect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-2xl border-2 border-emerald-300 shadow-[0_0_0_9999px_rgba(2,6,23,0.72)] transition-[top,left,width,height] duration-200 motion-reduce:transition-none"
          style={targetRect}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-slate-950/75" />
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vivace-onboarding-title"
        aria-describedby="vivace-onboarding-description"
        className="fixed z-[101] max-h-[calc(100dvh-2rem-var(--safe-bottom))] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
        style={cardStyle}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
            Conoce Vivace Suite
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Paso {currentIndex + 1} de {steps.length}
          </p>
        </div>

        <h2 id="vivace-onboarding-title" className="mt-4 text-2xl font-bold text-slate-950">
          {step.title}
        </h2>
        <p id="vivace-onboarding-description" className="mt-3 text-sm leading-6 text-slate-600">
          {step.description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <VivaceButton variant="ghost" onClick={onSkip} className="sm:mr-auto">
            Omitir recorrido
          </VivaceButton>
          {!isFirst ? (
            <VivaceButton variant="outline" onClick={onBack}>
              Atrás
            </VivaceButton>
          ) : null}
          <VivaceButton onClick={onNext}>
            {isFirst
              ? "Comenzar recorrido"
              : isLast
                ? "Comenzar a usar Vivace Suite"
                : "Siguiente"}
          </VivaceButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function getCardPosition(target: TargetRect | null): CSSProperties {
  if (!target) {
    return {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const margin = 16;
  const estimatedCardHeight = 330;
  const availableBelow = window.innerHeight - (target.top + target.height);
  const top =
    availableBelow >= estimatedCardHeight + margin
      ? target.top + target.height + 12
      : Math.max(margin, target.top - estimatedCardHeight - 12);

  return {
    left: Math.min(
      Math.max(margin, target.left),
      Math.max(margin, window.innerWidth - Math.min(448, window.innerWidth - 32) - margin),
    ),
    top,
  };
}
