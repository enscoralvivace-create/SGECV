export type IntakeWindowStatus = "open" | "closed" | "expired" | "revoked";
export type IntakeRequestStatus = "pending" | "approved" | "rejected";
export type IntakeRequestedRole = "student" | "member";

export interface CreatedIntakeWindow {
  id: string;
  name: string;
  expiresAt: string;
  plainToken: string;
}

export interface IntakeWindowSummary {
  id: string;
  name: string;
  status: IntakeWindowStatus;
  expiresAt: string;
  createdAt: string;
  closedAt: string | null;
  message: string | null;
  pendingCount: number;
}

export interface IntakeWindowValidation {
  isAvailable: boolean;
  resultCode: string;
  name: string | null;
  message: string | null;
  expiresAt: string | null;
}

export interface IntakeRequest {
  id: number;
  windowId: string;
  windowName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  requestedVoice: string | null;
  requestedRole: IntakeRequestedRole;
  notes: string | null;
  status: IntakeRequestStatus;
  rejectionReason: string | null;
  memberId: number | null;
  invitationId: string | null;
  invitationDeliveryStatus: "manual_pending" | "sent" | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ApprovedIntakeRequest {
  requestId: number;
  memberId: number;
  memberResolution: "created" | "existing";
  invitationId: string;
  invitationExpiresAt: string;
  plainInvitationToken: string;
  deliveryStatus: "manual_pending";
}

export interface IntakeRequestInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  requestedVoice?: string;
  notes?: string;
}
