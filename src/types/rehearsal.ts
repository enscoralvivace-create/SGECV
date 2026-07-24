export type RehearsalExceptionType =
  | "cancelled"
  | "modified"
  | "extra";

export interface RehearsalException {
  id: string;
  event_date: string;
  exception_type: RehearsalExceptionType;
  title: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  notes: string | null;
}

export interface Rehearsal {
  id: string;
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
  notes: string | null;
  status: "scheduled" | "modified" | "cancelled" | "extra";
  isRegular: boolean;
  exceptionId: string | null;
}