"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";
import VivacePageHeader from "@/components/ui/VivacePageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import MemberAccountStatementModal from "@/components/fees/MemberAccountStatementModal";
import MemberFormModal from "@/components/members/MemberFormModal";
import MemberStatisticsModal from "@/components/members/MemberStatisticsModal";
import MembersTable from "@/components/members/MembersTable";
import PendingMembersCard from "@/components/members/PendingMembersCard";

import { supabase } from "@/lib/supabase";

import {
  createMember,
  getMembers,
  updateMember,
  updateMemberStatus,
} from "@/services/memberService";

import type {
  Member,
  MemberFormData,
} from "@/types/member";

import {
  emptyMemberForm,
  memberFormToPayload,
  memberToForm,
} from "@/utils/member";

export default function MembersPage() {
  const router = useRouter();

  const [members, setMembers] =
    useState<Member[]>([]);

  const [form, setForm] =
    useState<MemberFormData>(
      emptyMemberForm,
    );

  const [editingMember, setEditingMember] =
    useState<Member | null>(null);

  const [
    accountStatementMember,
    setAccountStatementMember,
  ] = useState<Member | null>(null);

  const [
    statisticsMember,
    setStatisticsMember,
  ] = useState<Member | null>(null);

  const [search, setSearch] =
    useState("");

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [memberToConfirm, setMemberToConfirm] =
    useState<Member | null>(null);

  const [message, setMessage] =
    useState("");

  const loadMembers = useCallback(
    async () => {
      const membersData =
        await getMembers();

      setMembers(membersData);
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    async function initializePage() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(error);

        if (isMounted) {
          setMessage(
            "No fue posible comprobar la sesión del usuario.",
          );

          setIsLoading(false);
        }

        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const membersData =
          await getMembers();

        if (isMounted) {
          setMembers(membersData);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setMessage(
            error instanceof Error
              ? `No fue posible cargar los integrantes: ${error.message}`
              : "No fue posible cargar los integrantes.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void initializePage();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const pendingMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.status.toLowerCase() ===
          "pendiente",
      ),
    [members],
  );

  const managedMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.status.toLowerCase() !==
          "pendiente",
      ),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return managedMembers;
    }

    return managedMembers.filter(
      (member) => {
        const searchableText = [
          member.name,
          member.last_name,
          member.voice ?? "",
          member.phone ?? "",
          member.email ?? "",
          member.status,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch,
        );
      },
    );
  }, [managedMembers, search]);

  function openCreateForm() {
    setEditingMember(null);
    setForm(emptyMemberForm);
    setMessage("");
    setIsFormOpen(true);
  }

  function openEditForm(
    member: Member,
  ) {
    setEditingMember(member);
    setForm(memberToForm(member));
    setMessage("");
    setIsFormOpen(true);
  }

  function openStatistics(
    member: Member,
  ) {
    setStatisticsMember(member);
  }

  function closeStatistics() {
    setStatisticsMember(null);
  }

  function openAccountStatement(
    member: Member,
  ) {
    setAccountStatementMember(member);
  }

  function closeAccountStatement() {
    setAccountStatementMember(null);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setEditingMember(null);
    setForm(emptyMemberForm);
    setIsFormOpen(false);
  }

  function handleApprovalStatusChanged(
    memberId: number,
    status: "Activo" | "Inactivo",
  ) {
    setMembers((currentMembers) =>
      currentMembers.map((currentMember) =>
        currentMember.id === memberId
          ? {
              ...currentMember,
              status,
            }
          : currentMember,
      ),
    );

    setMessage(
      status === "Activo"
        ? "Integrante aprobado correctamente."
        : "Solicitud rechazada correctamente.",
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage(
        "Escribe el nombre del integrante.",
      );

      return;
    }

    if (!form.lastName.trim()) {
      setMessage(
        "Escribe los apellidos del integrante.",
      );

      return;
    }

    if (!form.voice) {
      setMessage(
        "Selecciona una voz o función.",
      );

      return;
    }

    const wasEditing =
      editingMember !== null;

    setIsSaving(true);
    setMessage("");

    try {
      const payload =
        memberFormToPayload(form);

      if (editingMember) {
        await updateMember(
          editingMember.id,
          payload,
        );
      } else {
        await createMember(payload);
      }

      await loadMembers();

      setEditingMember(null);
      setForm(emptyMemberForm);
      setIsFormOpen(false);

      setMessage(
        wasEditing
          ? "Integrante actualizado correctamente."
          : "Integrante guardado correctamente.",
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? `No fue posible guardar el integrante: ${error.message}`
          : "No fue posible guardar el integrante.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleToggleStatus(
    member: Member,
  ): void {
    setMemberToConfirm(member);
  }

  function closeConfirmDialog(): void {
    if (processingId !== null) {
      return;
    }

    setMemberToConfirm(null);
  }

  async function confirmToggleStatus(): Promise<void> {
    if (!memberToConfirm) {
      return;
    }

    const member = memberToConfirm;

    const fullName = [
      member.name,
      member.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    const isDeactivated =
      member.status.toLowerCase() ===
      "baja definitiva";

    const newStatus = isDeactivated
      ? "Activo"
      : "Baja definitiva";

    const actionText = isDeactivated
      ? "reactivar"
      : "dar de baja";

    try {
      setProcessingId(member.id);
      setMessage("");

      await updateMemberStatus(
        member.id,
        newStatus,
      );

      setMembers((currentMembers) =>
        currentMembers.map(
          (currentMember) =>
            currentMember.id === member.id
              ? {
                  ...currentMember,
                  status: newStatus,
                }
              : currentMember,
        ),
      );

      setMemberToConfirm(null);

      setMessage(
        isDeactivated
          ? `${fullName} fue reactivado correctamente.`
          : `${fullName} fue dado de baja correctamente.`,
      );
    } catch (error: unknown) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : `No se pudo ${actionText} al integrante.`,
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <section className="mx-auto max-w-7xl">
        <VivacePageHeader
          eyebrow="Gestión coral"
          title="Integrantes"
          description="Administra integrantes, solicitudes pendientes, perfiles, estadísticas y estados de cuenta."
        />

        {!isLoading && (
          <PendingMembersCard
            members={pendingMembers}
            onStatusChanged={
              handleApprovalStatusChanged
            }
          />
        )}

        <div className="h-4 sm:h-6" />

        <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:rounded-3xl sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Lista de integrantes
            </h2>

            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              {managedMembers.length}{" "}
              {managedMembers.length === 1
                ? "integrante registrado"
                : "integrantes registrados"}
              .
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-auto">
            <input
              type="search"
              placeholder="Buscar por nombre, voz, correo o teléfono"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 sm:w-96 sm:text-sm"
            />

            <Button onClick={openCreateForm} className="w-full sm:w-auto">
              + Nuevo integrante
            </Button>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm sm:mb-6 sm:px-5 sm:py-4">
            {message}
          </div>
        )}

        <MembersTable
          members={filteredMembers}
          search={search}
          isLoading={isLoading}
          processingId={processingId}
          onEdit={openEditForm}
          onStatistics={
            openStatistics
          }
          onAccountStatement={
            openAccountStatement
          }
          onToggleStatus={handleToggleStatus}
        />
      </section>

      {isFormOpen && (
        <MemberFormModal
          form={form}
          setForm={setForm}
          editingMember={editingMember}
          isSaving={isSaving}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      {statisticsMember && (
        <MemberStatisticsModal
          member={statisticsMember}
          onClose={closeStatistics}
        />
      )}

      {accountStatementMember && (
        <MemberAccountStatementModal
          member={{
            id: accountStatementMember.id,
            name: [
              accountStatementMember.name,
              accountStatementMember.last_name,
            ]
              .filter(Boolean)
              .join(" "),
          }}
          onClose={closeAccountStatement}
        />
      )}

      {memberToConfirm && (
        <ConfirmDialog
          open={true}
          title={
            memberToConfirm.status.toLowerCase() ===
            "baja definitiva"
              ? "Reactivar integrante"
              : "Dar de baja al integrante"
          }
          description={
            memberToConfirm.status.toLowerCase() ===
            "baja definitiva"
              ? `¿Deseas reactivar a ${memberToConfirm.name} ${memberToConfirm.last_name}?`
              : `¿Deseas dar de baja definitivamente a ${memberToConfirm.name} ${memberToConfirm.last_name}?\n\nEl integrante conservará su cuenta y su historial.`
          }
          confirmLabel={
            memberToConfirm.status.toLowerCase() ===
            "baja definitiva"
              ? "Reactivar"
              : "Dar de baja"
          }
          variant={
            memberToConfirm.status.toLowerCase() ===
            "baja definitiva"
              ? "primary"
              : "danger"
          }
          loading={
            processingId === memberToConfirm.id
          }
          onCancel={closeConfirmDialog}
          onConfirm={() => {
            void confirmToggleStatus();
          }}
        />
      )}
    </main>
  );
}