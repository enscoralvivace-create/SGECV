import type {
  ChoirEvent,
  EventStatus,
  EventType,
} from "@/types/event";

export const EVENT_TYPES: EventType[] = [
  "Ensayo",
  "Concierto",
  "Misa",
  "Festival",
  "Taller",
  "Reunión",
  "Actividad social",
  "Viaje",
  "Otro",
];

export const EVENT_STATUSES: EventStatus[] = [
  "Programado",
  "Confirmado",
  "Cancelado",
  "Finalizado",
];

export function formatEventDate(date: string): string {
  if (!date) return "Fecha no disponible";

  const parsedDate = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export function formatEventTime(time: string | null): string {
  if (!time) return "Horario pendiente";

  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatEventSchedule(
  startTime: string | null,
  endTime: string | null
): string {
  if (!startTime && !endTime) {
    return "Horario pendiente";
  }

  if (startTime && !endTime) {
    return formatEventTime(startTime);
  }

  if (!startTime && endTime) {
    return `Hasta las ${formatEventTime(endTime)}`;
  }

  return `${formatEventTime(startTime)} – ${formatEventTime(endTime)}`;
}

export function getDaysUntilEvent(eventDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const event = new Date(`${eventDate}T12:00:00`);
  event.setHours(0, 0, 0, 0);

  const difference = event.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

export function getEventCountdown(eventDate: string): string {
  const days = getDaysUntilEvent(eventDate);

  if (days < 0) {
    return "Evento finalizado";
  }

  if (days === 0) {
    return "Hoy";
  }

  if (days === 1) {
    return "Mañana";
  }

  return `Faltan ${days} días`;
}

export function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    Ensayo: "🎼 Ensayo",
    Concierto: "🎤 Concierto",
    Misa: "⛪ Misa",
    Festival: "🎭 Festival",
    Taller: "🎓 Taller",
    Reunión: "👥 Reunión",
    "Actividad social": "🎉 Actividad social",
    Viaje: "✈️ Viaje",
    Otro: "📌 Otro",
  };

  return labels[type];
}

export function sortEventsByDate(
  events: ChoirEvent[]
): ChoirEvent[] {
  return [...events].sort((firstEvent, secondEvent) => {
    const firstDateTime = `${firstEvent.event_date}T${
      firstEvent.start_time ?? "00:00:00"
    }`;

    const secondDateTime = `${secondEvent.event_date}T${
      secondEvent.start_time ?? "00:00:00"
    }`;

    return (
      new Date(firstDateTime).getTime() -
      new Date(secondDateTime).getTime()
    );
  });
}