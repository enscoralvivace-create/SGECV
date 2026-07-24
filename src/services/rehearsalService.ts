import { supabase } from "@/lib/supabase";
import type { RehearsalException } from "@/types/rehearsal";

export async function getRehearsalExceptionByDate(
  eventDate: string,
): Promise<RehearsalException | null> {
  const { data, error } = await supabase
    .from("rehearsal_exceptions")
    .select(`
      id,
      event_date,
      exception_type,
      start_time,
      end_time,
      location,
      notes,
      title
    `)
    .eq("event_date", eventDate)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No fue posible consultar la excepción del ensayo: ${error.message}`,
    );
  }

  return data as RehearsalException | null;
}

export async function getRehearsalExceptions(
  startDate: string,
  endDate: string,
): Promise<RehearsalException[]> {
  const { data, error } = await supabase
    .from("rehearsal_exceptions")
    .select(`
      id,
      event_date,
      exception_type,
      start_time,
      end_time,
      location,
      notes,
      title
    `)
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(
      `No fue posible consultar las excepciones: ${error.message}`,
    );
  }

  return (data ?? []) as RehearsalException[];
}