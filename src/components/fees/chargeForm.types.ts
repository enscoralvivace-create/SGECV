import type { FeeType } from "@/services/feeService";
import type { Member } from "@/types/member";
import type { FeeAccessState } from "@/types/feeAccess";

export type ChargeScope = "individual" | "group";

export interface ChargeFormData {
  memberId: string;
  feeTypeId: string;
  amount: string;
  billingPeriod: string;
  dueDate: string;
  notes: string;
}

export const INITIAL_CHARGE_FORM_DATA: ChargeFormData = {
  memberId: "",
  feeTypeId: "",
  amount: "",
  billingPeriod: "",
  dueDate: "",
  notes: "",
};

export interface ChargeScopeSelectorProps
  extends ChargeAccessProps {
  onSelect: (scope: ChargeScope) => void;
}

export type ChargeAccessProps = Pick<
  FeeAccessState,
  | "canManageFees"
  | "isLoadingAccess"
  | "accessError"
>;

export interface ChargeFormProps {
  chargeScope: ChargeScope;
  activeMembers: Member[];
  isLoadingMembers: boolean;
  membersError: string | null;
  feeTypes: FeeType[];
  isLoadingFeeTypes: boolean;
  feeTypesError: string | null;
  onBack: () => void;
  onClose: () => void;
}
