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
  const { error } = await supabase
    .from("repertoire")
    .update(formToPayload(form))
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateRepertoireStatus(
  id: number,
  status: RepertoireFormData["status"],
): Promise<void> {
  const { error } = await supabase
    .from("repertoire")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}