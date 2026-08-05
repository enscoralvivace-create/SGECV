"use client";

import {
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import VivaceButton from "@/components/ui/VivaceButton";
import VivaceLoading from "@/components/ui/VivaceLoading";
import VivaceModal from "@/components/ui/VivaceModal";
import {
  getAttendanceSessionExceptions,
  saveAttendanceSessionExceptions,
} from "@/services/attendanceExceptionService";
import type {
  AttendanceExceptionMember,
} from "@/services/attendanceExceptionService";

interface AttendanceExceptionModalProps {
  isOpen: boolean;
  sessionId: string;
  sessionTitle: string;
  onClose: () => void;
}

export default function AttendanceExceptionModal({
  isOpen,
  sessionId,
  sessionTitle,
  onClose,
}: AttendanceExceptionModalProps) {
  const [members, setMembers] =
    useState<AttendanceExceptionMember[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCurrent = true;
    setIsLoading(true);
    setError(null);
    setSearch("");

    void getAttendanceSessionExceptions(sessionId)
      .then((loadedMembers) => {
        if (isCurrent) {
          setMembers(loadedMembers);
        }
      })
      .catch((loadError: unknown) => {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No fue posible cargar las excepciones.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, sessionId]);

  const visibleMembers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-MX");

    if (!term) {
      return members;
    }

    return members.filter((member) =>
      [member.name, member.last_name, member.voice]
        .join(" ")
        .toLocaleLowerCase("es-MX")
        .includes(term),
    );
  }, [members, search]);

  function updateMember(
    memberId: number,
    changes: Partial<Pick<AttendanceExceptionMember, "hasException" | "reason">>,
  ): void {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === memberId
          ? { ...member, ...changes }
          : member,
      ),
    );
  }

  function handleClose(): void {
    if (!isSaving) {
      onClose();
    }
  }

  async function handleSave(): Promise<void> {
    if (isLoading || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveAttendanceSessionExceptions(
        sessionId,
        members
          .filter((member) => member.hasException)
          .map((member) => ({
            memberId: member.id,
            reason: member.reason,
          })),
      );
      onClose();
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No fue posible guardar las excepciones.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <VivaceModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Excepciones de registro tardío"
      description={sessionTitle}
      size="lg"
      closeOnBackdrop={!isSaving}
      closeOnEscape={!isSaving}
      className="max-sm:max-h-[96vh] max-sm:rounded-2xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <VivaceButton
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancelar
          </VivaceButton>
          <VivaceButton
            onClick={() => void handleSave()}
            disabled={isLoading || isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar excepciones"}
          </VivaceButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Las personas seleccionadas podrán registrar hasta el cierre de la sesión. Su asistencia se clasificará como retardo.
            </p>
          </div>
        </div>

        <label className="relative block">
          <span className="sr-only">Buscar integrante</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o voz"
            disabled={isLoading || isSaving}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
          />
        </label>

        {error ? (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {isLoading ? (
          <VivaceLoading message="Cargando integrantes activos..." variant="inline" />
        ) : visibleMembers.length === 0 ? (
          <p className="rounded-xl border border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            No hay integrantes activos que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
            {visibleMembers.map((member) => (
              <div key={member.id} className={member.hasException ? "bg-emerald-50/60 p-4" : "bg-white p-4"}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={member.hasException}
                    disabled={isSaving}
                    onChange={(event) => updateMember(member.id, { hasException: event.target.checked })}
                    className="mt-1 h-5 w-5 shrink-0 accent-emerald-800"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-950">
                      {member.name} {member.last_name}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-500">
                      {member.voice}
                    </span>
                  </span>
                </label>

                {member.hasException ? (
                  <label className="mt-3 block pl-8">
                    <span className="mb-1.5 flex justify-between gap-3 text-xs font-semibold text-slate-600">
                      <span>Motivo opcional</span>
                      <span>{member.reason.length}/250</span>
                    </span>
                    <textarea
                      value={member.reason}
                      maxLength={250}
                      rows={2}
                      disabled={isSaving}
                      onChange={(event) => updateMember(member.id, { reason: event.target.value })}
                      placeholder="Ej. Sale tarde del trabajo"
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                    />
                  </label>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </VivaceModal>
  );
}
