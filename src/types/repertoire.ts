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

  score_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  translation: string | null;
  pronunciation: string | null;
  director_notes: string | null;

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

  scoreUrl: string;
  audioUrl: string;
  videoUrl: string;
  translation: string;
  pronunciation: string;
  directorNotes: string;
}