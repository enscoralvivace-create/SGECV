export type EventType =
  | "Ensayo"
  | "Concierto"
  | "Misa"
  | "Festival"
  | "Taller"
  | "Reunión"
  | "Actividad social"
  | "Viaje"
  | "Otro";

export type EventStatus =
  | "Programado"
  | "Confirmado"
  | "Cancelado"
  | "Finalizado";

export interface ChoirEvent {
  id: number;
  title: string;
  event_type: EventType;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
  status: EventStatus;
  is_extra: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChoirEventPayload {
  title: string;
  event_type: EventType;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
  status: EventStatus;
  is_extra: boolean;
}

export type RehearsalExceptionType =
  | "Cancelado"
  | "Extra"
  | "Modificado";

export interface RehearsalException {
  id: number;
  event_date: string;
  exception_type: RehearsalExceptionType;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
}