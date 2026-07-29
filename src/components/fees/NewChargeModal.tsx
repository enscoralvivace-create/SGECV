"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

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
}

export default function NewChargeModal({
  onClose,
}: NewChargeModalProps) {
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
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administración financiera
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
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

        {chargeScope === null && (
          <ChargeScopeSelector
            onSelect={setChargeScope}
          />
        )}

        {chargeScope === "individual" && (
          <IndividualChargeForm
            activeMembers={activeMembers}
            isLoadingMembers={isLoadingMembers}
            membersError={membersError}
            feeTypes={feeTypes}
            isLoadingFeeTypes={isLoadingFeeTypes}
            feeTypesError={feeTypesError}
            onBack={handleBack}
            onClose={onClose}
          />
        )}

        {chargeScope === "group" && (
          <GroupChargeForm
            activeMembersCount={activeMembers.length}
            isLoadingMembers={isLoadingMembers}
            membersError={membersError}
            feeTypes={feeTypes}
            isLoadingFeeTypes={isLoadingFeeTypes}
            feeTypesError={feeTypesError}
            onBack={handleBack}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}