export const MEMBER_STATUS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  PENDING: "Pendiente",
  LEAVE: "Permiso temporal",
  REMOVED: "Baja definitiva",
} as const;

export const VOICES = [
  "Soprano",
  "Mezzosoprano",
  "Contralto",
  "Tenor",
  "Barítono",
  "Bajo",
  "Director",
  "Pianista",
] as const;

export const REHEARSAL_DAYS = [
  "Martes",
  "Jueves",
] as const;