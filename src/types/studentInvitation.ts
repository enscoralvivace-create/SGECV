export type StudentInvitationStatus =
  | "active"
  | "expired"
  | "used"
  | "revoked";

export interface StudentInvitationSummary {
  id: string;
  memberId: number;
  memberFullName: string;
  emailNormalized: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  status: StudentInvitationStatus;
}

export interface CreatedStudentInvitation {
  invitationId: string;
  memberId: number;
  emailNormalized: string;
  expiresAt: string;
  plainToken: string;
}

export interface StudentInvitationValidation {
  isValid: boolean;
  resultCode: string;
  expectedEmailMasked: string | null;
}

export interface StudentInvitationConsumption {
  success: boolean;
  resultCode: string;
}
