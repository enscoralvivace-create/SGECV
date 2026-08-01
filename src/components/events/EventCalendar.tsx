"use client";

import { useMemo, useState } from "react";
import type { ChoirEvent } from "@/types/event";
import {
  formatEventSchedule,
  getEventTypeLabel,
} from "@/utils/event";

interface EventCalendarProps {
  events: ChoirEvent[];
}

const WEEK_DAYS = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
];

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function capitalizeFirstLetter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function EventCalendar({
  events,
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
  });

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, ChoirEvent[]>>(
      (accumulator, event) => {
        if (!accumulator[event.event_date]) {
          accumulator[event.event_date] = [];
        }

        accumulator[event.event_date].push(event);

        return accumulator;
      },
      {}
    );
  }, [events]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const mondayBasedStartDay =
      (firstDayOfMonth.getDay() + 6) % 7;

    const days: Array<Date | null> = [];

    for (let index = 0; index < mondayBasedStartDay; index += 1) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= lastDayOfMonth.getDate();
      day += 1
    ) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentDate]);

  const selectedEvents = selectedDate
    ? eventsByDate[selectedDate] ?? []
    : [];

  const monthTitle = capitalizeFirstLetter(
    new Intl.DateTimeFormat("es-MX", {
      month: "long",
      year: "numeric",
    }).format(currentDate)
  );

  function goToPreviousMonth() {
    setCurrentDate(
      (currentValue) =>
        new Date(
          currentValue.getFullYear(),
          currentValue.getMonth() - 1,
          1
        )
    );

    setSelectedDate(null);
  }

  function goToNextMonth() {
    setCurrentDate(
      (currentValue) =>
        new Date(
          currentValue.getFullYear(),
          currentValue.getMonth() + 1,
          1
        )
    );

    setSelectedDate(null);
  }

  function goToCurrentMonth() {
    const today = new Date();

    setCurrentDate(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setSelectedDate(getDateKey(today));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 sm:gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Calendario mensual
          </p>

          <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
            {monthTitle}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            aria-label="Mes anterior"
          >
            ←
          </button>

          <button
            type="button"
            onClick={goToCurrentMonth}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            aria-label="Mes siguiente"
          >
            →
          </button>
        </div>
      </header>

      <div className="overflow-x-auto p-4 sm:p-5">
        <div className="min-w-[700px]">
          <div className="grid min-w-[560px] grid-cols-7 border-b border-slate-200">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid min-w-[560px] grid-cols-7">
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-28 border-b border-r border-slate-100 bg-slate-50/50"
                  />
                );
              }

              const dateKey = getDateKey(date);
              const dayEvents = eventsByDate[dateKey] ?? [];

              const todayKey = getDateKey(new Date());
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-h-28 border-b border-r border-slate-100 p-2 text-left transition hover:bg-indigo-50 ${
                    isSelected ? "bg-indigo-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                        isToday
                          ? "bg-indigo-600 text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="truncate rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700"
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}

                    {dayEvents.length > 2 && (
                      <p className="px-1 text-xs font-medium text-slate-500">
                        +{dayEvents.length - 2} más
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="border-t border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-900">
            Eventos del día
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {new Intl.DateTimeFormat("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(`${selectedDate}T12:00:00`))}
          </p>

          {selectedEvents.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">
              No hay eventos registrados para esta fecha.
            </div>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {selectedEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-medium text-indigo-600">
                    {getEventTypeLabel(event.event_type)}
                  </p>

                  <h4 className="mt-1 font-bold text-slate-900">
                    {event.title}
                  </h4>

                  <p className="mt-2 text-sm text-slate-600">
                    {formatEventSchedule(
                      event.start_time,
                      event.end_time
                    )}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {event.location || "Lugar pendiente"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}