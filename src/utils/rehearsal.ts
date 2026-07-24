import type {
  Rehearsal,
  RehearsalException,
} from "@/types/rehearsal";

const REGULAR_START_TIME = "20:00";
const REGULAR_END_TIME = "22:00";

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createRegularRehearsal(date: Date): Rehearsal {
  const dateString = formatDateToISO(date);

  return {
    id: `regular-${dateString}`,
    date: dateString,
    title: "Ensayo regular",
    startTime: REGULAR_START_TIME,
    endTime: REGULAR_END_TIME,
    location: null,
    notes: null,
    status: "scheduled",
    isRegular: true,
    exceptionId: null,
  };
}

function applyException(
  rehearsal: Rehearsal | null,
  exception: RehearsalException,
): Rehearsal | null {
  if (exception.exception_type === "extra") {
    return {
      id: `extra-${exception.id}`,
      date: exception.event_date,
      title: exception.title || "Ensayo extraordinario",
      startTime: exception.start_time || REGULAR_START_TIME,
      endTime: exception.end_time || REGULAR_END_TIME,
      location: exception.location,
      notes: exception.notes,
      status: "extra",
      isRegular: false,
      exceptionId: exception.id,
    };
  }

  if (!rehearsal) {
    return null;
  }

  if (exception.exception_type === "cancelled") {
    return {
      ...rehearsal,
      title: exception.title || "Ensayo cancelado",
      location: exception.location,
      notes: exception.notes,
      status: "cancelled",
      exceptionId: exception.id,
    };
  }

  if (exception.exception_type === "modified") {
    return {
      ...rehearsal,
      title: exception.title || "Ensayo modificado",
      startTime: exception.start_time || rehearsal.startTime,
      endTime: exception.end_time || rehearsal.endTime,
      location: exception.location,
      notes: exception.notes,
      status: "modified",
      exceptionId: exception.id,
    };
  }

  return rehearsal;
}

export function getRehearsalForDate(
  date: Date,
  exceptions: RehearsalException[],
): Rehearsal | null {
  const dateString = formatDateToISO(date);
  const dayOfWeek = date.getDay();

  // JavaScript: domingo = 0, martes = 2, jueves = 4.
  const isRegularRehearsalDay =
    dayOfWeek === 2 || dayOfWeek === 4;

  const exception = exceptions.find(
    (item) => item.event_date === dateString,
  );

  let rehearsal = isRegularRehearsalDay
    ? createRegularRehearsal(date)
    : null;

  if (exception) {
    rehearsal = applyException(rehearsal, exception);
  }

  return rehearsal;
}