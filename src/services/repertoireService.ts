import { supabase } from "@/lib/supabase";

import type {
  RepertoireFormData,
  RepertoireItem,
} from "@/types/repertoire";

interface RepertoirePayload {
  title: string;
  composer: string | null;
  arranger: string | null;
  key: string | null;
  duration_minutes: number | null;
  status: RepertoireFormData["status"];
  notes: string | null;
}

export interface RepertoireResourcesData {
  scoreUrl: string;
  audioUrl: string;
  videoUrl: string;
  translation: string;
  pronunciation: string;
  directorNotes: string;
}

interface RepertoireResourcesPayload {
  score_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  translation: string | null;
  pronunciation: string | null;
  director_notes: string | null;
}

function formToPayload(
  form: RepertoireFormData,
): RepertoirePayload {
  const parsedDuration = Number(
    form.durationMinutes,
  );

  return {
    title: form.title.trim(),
    composer:
      form.composer.trim() || null,
    arranger:
      form.arranger.trim() || null,
    key:
      form.key.trim() || null,
    duration_minutes:
      form.durationMinutes.trim() &&
      Number.isFinite(parsedDuration)
        ? parsedDuration
        : null,
    status: form.status,
    notes:
      form.notes.trim() || null,
  };
}

function resourcesToPayload(
  resources: RepertoireResourcesData,
): RepertoireResourcesPayload {
  return {
    score_url:
      resources.scoreUrl.trim() || null,
    audio_url:
      resources.audioUrl.trim() || null,
    video_url:
      resources.videoUrl.trim() || null,
    translation:
      resources.translation.trim() || null,
    pronunciation:
      resources.pronunciation.trim() || null,
    director_notes:
      resources.directorNotes.trim() || null,
  };
}

export async function getRepertoire(): Promise<
  RepertoireItem[]
> {
  const { data, error } = await supabase
    .from("repertoire")
    .select("*")
    .order("title", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RepertoireItem[];
}

export async function createRepertoireItem(
  form: RepertoireFormData,
): Promise<void> {
  const { error } = await supabase
    .from("repertoire")
    .insert(formToPayload(form));

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateRepertoireItem(
  id: number,
  form: RepertoireFormData,
): Promise<void> {
  const { data, error } = await supabase
    .from("repertoire")
    .update(formToPayload(form))
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "La obra no pudo actualizarse. Revisa las políticas RLS de Supabase.",
    );
  }
}

export async function updateRepertoireStatus(
  id: number,
  status: RepertoireFormData["status"],
): Promise<void> {
  const { data, error } = await supabase
    .from("repertoire")
    .update({
      status,
    })
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "El estado no pudo actualizarse. Revisa las políticas RLS de Supabase.",
    );
  }
}

export async function updateRepertoireResources(
  id: number,
  resources: RepertoireResourcesData,
): Promise<void> {
  const { data, error } = await supabase
    .from("repertoire")
    .update(resourcesToPayload(resources))
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Los recursos no pudieron actualizarse. Revisa las políticas RLS de Supabase.",
    );
  }
}