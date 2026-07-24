import { supabase } from "@/lib/supabase";
import type {
  ChoirEvent,
  ChoirEventPayload,
} from "@/types/event";

const EVENTS_TABLE = "choir_events";

export async function getEvents(): Promise<ChoirEvent[]> {
  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select("*")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ChoirEvent[];
}

export async function createEvent(
  event: ChoirEventPayload
): Promise<void> {
  const { error } = await supabase
    .from(EVENTS_TABLE)
    .insert(event);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateEvent(
  id: number,
  event: ChoirEventPayload
): Promise<void> {
  const { error } = await supabase
    .from(EVENTS_TABLE)
    .update(event)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteEvent(
  id: number
): Promise<void> {
  const { error } = await supabase
    .from(EVENTS_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getNextEvent(): Promise<ChoirEvent | null> {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select("*")
    .gte("event_date", today)
    .neq("status", "Cancelado")
    .order("event_date", {
      ascending: true,
    })
    .order("start_time", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ChoirEvent | null;
}