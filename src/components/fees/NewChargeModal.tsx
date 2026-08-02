"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import AccessDenied from "@/components/auth/AccessDenied";
import VivaceLoading from "@/components/ui/VivaceLoading";
import useUserAccess from "@/hooks/useUserAccess";
import {
  getActiveFeeTypes,
  type FeeType,
} from "@/services/feeService";
import { getMembers } from "@/services/memberService";
import type { Member } from "@/types/member";

import ChargeScopeSelector from "./ChargeScopeSelector";
import GroupChargeForm from "./GroupChargeForm";
import IndividualChargeForm from "./IndividualChargeForm";
import type { ChargeScope } from "./chargeForm.types";

interface NewChargeModalProps {
  onClose: () => void;
  onChargeCreated: () => void;
}

export default function NewChargeModal({
  onClose,
  onChargeCreated,
}: NewChargeModalProps) {
  const {
    isLoading: isLoadingAccess,
    error: accessError,
    hasPermission,
    reload: reloadAccess,
  } = useUserAccess();

  const canManageFees = hasPermission("fees.manage");

  const [chargeScope, setChargeScope] =
    useState<ChargeScope | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] =
    useState(true);
  const [membersError, setMembersError] =
    useState<string | null>(null);

  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [isLoadingFeeTypes, setIsLoadingFeeTypes] =
    useState(true);
  const [feeTypesError, setFeeTypesError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isLoadingAccess || !canManageFees) {
      return;
    }

    let isMounted = true;

    async function loadMembers() {
      try {
        setIsLoadingMembers(true);
        setMembersError(null);

        const data = await getMembers();

        if (isMounted) {
          setMembers(data);
        }
      } catch (error) {
        if (isMounted) {
          setMembersError(
            error instanceof Error
              ? error.message
              : "No fue posible cargar los integrantes.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingMembers(false);
        }
      }
    }

    async function loadFeeTypes() {
      try {
        setIsLoadingFeeTypes(true);
        setFeeTypesError(null);

        const data = await getActiveFeeTypes();

        if (isMounted) {
          setFeeTypes(data);
        }
      } catch (error) {
        if (isMounted) {
          setFeeTypesError(
            error instanceof Error
              ? error.message
              : "No fue posible cargar los tipos de cuota.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingFeeTypes(false);
        }
      }
    }

    void loadMembers();
    void loadFeeTypes();

    return () => {
      isMounted = false;
    };
  }, [canManageFees, isLoadingAccess]);

  useEffect(() => {
    if (!isLoadingAccess && !canManageFees) {
      setChargeScope(null);
    }
  }, [canManageFees, isLoadingAccess]);

  const activeMembers = useMemo(
    () =>
      members.filter(
        (member) => member.status === "Activo",
      ),
    [members],
  );

  function handleBack() {
    setChargeScope(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[calc(100dvh-var(--safe-top))] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
        <header className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administración financiera
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              Nuevo cargo
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {chargeScope === null
                ? "Selecciona el tipo de cargo que deseas crear."
                : chargeScope === "individual"
                  ? "Asigna un cargo a un integrante."
                  : "Asigna un cargo a todos los integrantes activos."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {isLoadingAccess ? (
          <VivaceLoading
            message="Verificando permisos..."
            className="min-h-64 rounded-none border-0 shadow-none"
          />
        ) : !canManageFees ? (
          <AccessDenied
            title="Acceso denegado"
            description={
              accessError ||
              "No cuentas con permisos para crear cargos."
            }
            showBackButton={false}
            showReloadButton
            onReload={() => {
              void reloadAccess();
            }}
            className="min-h-64"
          />
        ) : chargeScope === null ? (
          <ChargeScopeSelector
            onSelect={setChargeScope}
            canManageFees={canManageFees}
            isLoadingAccess={isLoadingAccess}
            accessError={accessError}
          />
        ) : chargeScope === "individual" ? (
          <IndividualChargeForm
            activeMembers={activeMembers}
            isLoadingMembers={isLoadingMembers}
            membersError={membersError}
            feeTypes={feeTypes}
            isLoadingFeeTypes={isLoadingFeeTypes}
            feeTypesError={feeTypesError}
            onBack={handleBack}
            onClose={onClose}
            onChargeCreated={onChargeCreated}
            canManageFees={canManageFees}
            isLoadingAccess={isLoadingAccess}
            accessError={accessError}
          />
        ) : (
          <GroupChargeForm
            activeMembersCount={activeMembers.length}
            isLoadingMembers={isLoadingMembers}
            membersError={membersError}
            feeTypes={feeTypes}
            isLoadingFeeTypes={isLoadingFeeTypes}
            feeTypesError={feeTypesError}
            onBack={handleBack}
            onClose={onClose}
            canManageFees={canManageFees}
            isLoadingAccess={isLoadingAccess}
            accessError={accessError}
          />
        )}
      </div>
    </div>
  );
}
