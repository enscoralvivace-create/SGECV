import type { Member } from "@/types/member";

export interface StudentInvitationEligibility {
  isEligible: boolean;
  reason: string;
}

export function getStudentInvitationEligibility(
  member: Member,
): StudentInvitationEligibility {
  if (member.status.trim().toLowerCase() !== "activo") {
    return {
      isEligible: false,
      reason: "El integrante debe estar activo.",
    };
  }

  if (!member.email?.trim()) {
    return {
      isEligible: false,
      reason: "El integrante no tiene correo.",
    };
  }

  if (member.auth_user_id) {
    return {
      isEligible: false,
      reason: "El integrante ya tiene una cuenta vinculada.",
    };
  }

  if (member.role !== "member" && member.role !== "student") {
    return {
      isEligible: false,
      reason: "El rol del integrante no permite invitarlo como alumno.",
    };
  }

  return {
    isEligible: true,
    reason: "",
  };
}
