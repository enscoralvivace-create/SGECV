import type {
  Member,
  MemberFormData,
  MemberPayload,
} from "@/types/member";

export const emptyMemberForm: MemberFormData = {
  name: "",
  lastName: "",
  voice: "",
  phone: "",
  email: "",
  joinDate: "",
  birthDate: "",
  status: "Activo",
  emergencyContact: "",
  emergencyPhone: "",
  observations: "",
};

export function memberFormToPayload(
  form: MemberFormData
): MemberPayload {
  if (!form.voice) {
    throw new Error("Selecciona una voz o función.");
  }

  return {
    name: form.name.trim(),
    last_name: form.lastName.trim(),
    voice: form.voice,
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    join_date: form.joinDate || null,
    birth_date: form.birthDate || null,
    status: form.status,
    emergency_contact: form.emergencyContact.trim() || null,
    emergency_phone: form.emergencyPhone.trim() || null,
    observations: form.observations.trim() || null,
  };
}

export function memberToForm(member: Member): MemberFormData {
  return {
    name: member.name,
    lastName: member.last_name,
    voice: member.voice,
    phone: member.phone ?? "",
    email: member.email ?? "",
    joinDate: member.join_date ?? "",
    birthDate: member.birth_date ?? "",
    status: member.status,
    emergencyContact: member.emergency_contact ?? "",
    emergencyPhone: member.emergency_phone ?? "",
    observations: member.observations ?? "",
  };
}