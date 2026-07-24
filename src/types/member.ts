export type MemberStatus =
  | "Activo"
  | "Permiso temporal"
  | "Inactivo"
  | "Baja definitiva";

export type MemberVoice =
  | "Soprano"
  | "Contralto"
  | "Tenor"
  | "Bajo"
  | "Director"
  | "Pianista"
  | "Administración"
  | "Otra";

export type Member = {
  id: number;
  auth_user_id: string | null;
  name: string;
  last_name: string;
  voice: MemberVoice;
  phone: string | null;
  email: string | null;
  join_date: string | null;
  birth_date: string | null;
  status: MemberStatus;
  emergency_contact: string | null;
  emergency_phone: string | null;
  observations: string | null;
  created_at: string;
};

export type MemberFormData = {
  name: string;
  lastName: string;
  voice: MemberVoice | "";
  phone: string;
  email: string;
  joinDate: string;
  birthDate: string;
  status: MemberStatus;
  emergencyContact: string;
  emergencyPhone: string;
  observations: string;
};

export type MemberPayload = {
  name: string;
  last_name: string;
  voice: MemberVoice;
  phone: string | null;
  email: string | null;
  join_date: string | null;
  birth_date: string | null;
  status: MemberStatus;
  emergency_contact: string | null;
  emergency_phone: string | null;
  observations: string | null;
};