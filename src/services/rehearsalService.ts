import { supabase } from "@/lib/supabase";
import type {
  Rehearsal,
  RehearsalException,
} from "@/types/rehearsal";
import {
  getRehearsalsForDate,
} from "@/utils/rehearsal";

interface ExtraChoirEventRow {
  id: number;
  event_date: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  description: string | null;
  status: string;
}

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

  if (data) {
    return data as RehearsalException;
  }

  const {
    data: extraEventsData,
    error: extraEventsError,
  } = await supabase
    .from("choir_events")
    .select(`
      id,
      event_date,
      title,
      start_time,
      end_time,
      location,
      description,
      status
    `)
    .eq("event_date", eventDate)
    .eq("is_extra", true)
    .neq("status", "Cancelado")
    .not("start_time", "is", null)
    .not("end_time", "is", null)
    .order("start_time", { ascending: true })
    .order("id", { ascending: true });

  if (extraEventsError) {
    throw new Error(
      `No fue posible consultar los eventos extraordinarios: ${extraEventsError.message}`,
    );
  }

  const usableExtraEvents = (
    (extraEventsData ?? []) as ExtraChoirEventRow[]
  ).filter(
    (event) =>
      event.status !== "Cancelado" &&
      event.title.trim().length > 0,
  );

  if (usableExtraEvents.length === 0) {
    return null;
  }

  if (usableExtraEvents.length > 1) {
    throw new Error(
      `Existe más de un evento extraordinario utilizable para ${eventDate}. No es posible determinar el ensayo de forma segura.`,
    );
  }

  const [extraEvent] = usableExtraEvents;

  return {
    id: String(extraEvent.id),
    event_date: extraEvent.event_date,
    exception_type: "extra",
    title: extraEvent.title,
    start_time: extraEvent.start_time,
    end_time: extraEvent.end_time,
    location: extraEvent.location,
    notes: extraEvent.description,
  };
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

export async function getRehearsalActivitiesForDate(
  date: Date,
): Promise<Rehearsal[]> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const eventDate = `${year}-${month}-${day}`;

  const [exceptionsResult, extraEventsResult] =
    await Promise.all([
      supabase
        .from("rehearsal_exceptions")
        .select("*")
        .eq("event_date", eventDate)
        .order("id", { ascending: true }),
      supabase
        .from("choir_events")
        .select(`
          id,
          event_date,
          title,
          start_time,
          end_time,
          location,
          description,
          status
        `)
        .eq("event_date", eventDate)
        .eq("is_extra", true)
        .neq("status", "Cancelado")
        .not("start_time", "is", null)
        .not("end_time", "is", null)
        .order("start_time", { ascending: true })
        .order("id", { ascending: true }),
    ]);

  if (exceptionsResult.error) {
    throw new Error(
      `No fue posible consultar las excepciones de ensayo: ${exceptionsResult.error.message}`,
    );
  }

  if (extraEventsResult.error) {
    throw new Error(
      `No fue posible consultar los eventos extraordinarios: ${extraEventsResult.error.message}`,
    );
  }

  const rehearsalExceptions =
    (exceptionsResult.data ?? []) as RehearsalException[];

  const extraEventExceptions = (
    (extraEventsResult.data ?? []) as ExtraChoirEventRow[]
  )
    .filter(
      (event) =>
        event.status !== "Cancelado" &&
        event.title.trim().length > 0,
    )
    .map<RehearsalException>((event) => ({
      id: `choir-event-${event.id}`,
      event_date: event.event_date,
      exception_type: "extra",
      title: event.title,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      notes: event.description,
    }));

  return getRehearsalsForDate(
    date,
    [
      ...rehearsalExceptions,
      ...extraEventExceptions,
    ],
  );
}
