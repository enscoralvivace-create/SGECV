import type {
  RepertoireFormData,
  RepertoireItem,
} from "@/types/repertoire";

export const emptyRepertoireForm: RepertoireFormData = {
  title: "",
  composer: "",
  arranger: "",
  key: "",
  durationMinutes: "",
  status: "En estudio",
  notes: "",
  scoreUrl: "",
  audioUrl: "",
  videoUrl: "",
  translation: "",
  pronunciation: "",
  directorNotes: "",
};

export function repertoireItemToForm(
  item: RepertoireItem,
): RepertoireFormData {
  return {
    title: item.title,
    composer: item.composer ?? "",
    arranger: item.arranger ?? "",
    key: item.key ?? "",
    durationMinutes:
      item.duration_minutes !== null
        ? String(item.duration_minutes)
        : "",
    status: item.status,
    notes: item.notes ?? "",
    scoreUrl: item.score_url ?? "",
    audioUrl: item.audio_url ?? "",
    videoUrl: item.video_url ?? "",
    translation: item.translation ?? "",
    pronunciation: item.pronunciation ?? "",
    directorNotes: item.director_notes ?? "",
  };
}