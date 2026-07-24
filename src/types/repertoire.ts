export type RepertoireStatus =
  | "Activo"
  | "En estudio"
  | "Archivado";

export interface RepertoireItem {
  id: number;
  title: string;
  composer: string | null;
  arranger: string | null;
  key: string | null;
  duration_minutes: number | null;
  status: RepertoireStatus;
  notes: string | null;
  created_at: string;
}

export interface RepertoireFormData {
  title: string;
  composer: string;
  arranger: string;
  key: string;
  durationMinutes: string;
  status: RepertoireStatus;
  notes: string;
}