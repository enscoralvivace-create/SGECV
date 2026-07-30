"use client";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  MapPin,
} from "lucide-react";

import type {
  Trip,
  TripStatus,
} from "@/types/trip";

interface TripDetailHeaderProps {
  trip: Trip;
}

interface TripStatusPresentation {
  label: string;
  className: string;
}

const tripStatusPresentation: Record<
  TripStatus,
  TripStatusPresentation
> = {
  planning: {
    label: "En planeación",
    className:
      "bg-amber-100 text-amber-800",
  },

  active: {
    label: "Activo",
    className:
      "bg-emerald-100 text-emerald-800",
  },

  completed: {
    label: "Completado",
    className:
      "bg-slate-200 text-slate-700",
  },

  cancelled: {
    label: "Cancelado",
    className:
      "bg-red-100 text-red-700",
  },
};

function formatTripDate(
  value: string | null,
): string {
  if (!value) {
    return "Fecha pendiente";
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function getTripDateRange(
  startDate: string | null,
  endDate: string | null,
): string {
  if (!startDate && !endDate) {
    return "Fechas por definir";
  }

  if (startDate && !endDate) {
    return `Desde el ${formatTripDate(
      startDate,
    )}`;
  }

  if (!startDate && endDate) {
    return `Hasta el ${formatTripDate(
      endDate,
    )}`;
  }

  if (startDate === endDate) {
    return formatTripDate(startDate);
  }

  return [
    formatTripDate(startDate),
    formatTripDate(endDate),
  ].join(" – ");
}

export default function TripDetailHeader({
  trip,
}: TripDetailHeaderProps) {
  const status =
    tripStatusPresentation[trip.status];

  const dateRange = getTripDateRange(
    trip.start_date,
    trip.end_date,
  );

  return (
    <section className="space-y-5">
      <Link
        href="/viajes"
        className="
          inline-flex items-center gap-2
          text-sm font-medium text-slate-600
          transition-colors
          hover:text-slate-950
        "
      >
        <ArrowLeft
          aria-hidden="true"
          className="h-4 w-4"
        />

        Volver a viajes
      </Link>

      <div
        className="
          rounded-2xl border border-slate-200
          bg-white p-6 shadow-sm
        "
      >
        <div
          className="
            flex flex-col gap-5
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <div
                className="
                  flex flex-wrap items-center gap-3
                "
              >
                <h1
                  className="
                    text-2xl font-bold
                    tracking-tight text-slate-950
                    sm:text-3xl
                  "
                >
                  {trip.name}
                </h1>

                <span
                  className={`
                    inline-flex rounded-full
                    px-3 py-1
                    text-xs font-semibold
                    ${status.className}
                  `}
                >
                  {status.label}
                </span>
              </div>

              {trip.description ? (
                <p
                  className="
                    max-w-3xl
                    whitespace-pre-line
                    text-sm leading-6
                    text-slate-600
                  "
                >
                  {trip.description}
                </p>
              ) : (
                <p
                  className="
                    text-sm text-slate-500
                  "
                >
                  Sin descripción registrada.
                </p>
              )}
            </div>

            <div
              className="
                flex flex-col gap-3
                text-sm text-slate-600
                sm:flex-row sm:flex-wrap
                sm:items-center sm:gap-6
              "
            >
              <div
                className="
                  flex items-center gap-2
                "
              >
                <MapPin
                  aria-hidden="true"
                  className="
                    h-4 w-4 shrink-0
                    text-slate-400
                  "
                />

                <span>
                  {trip.destination ||
                    "Destino pendiente"}
                </span>
              </div>

              <div
                className="
                  flex items-center gap-2
                "
              >
                <CalendarDays
                  aria-hidden="true"
                  className="
                    h-4 w-4 shrink-0
                    text-slate-400
                  "
                />

                <span>{dateRange}</span>
              </div>
            </div>
          </div>

          <div
            className="
              rounded-xl bg-slate-50
              px-5 py-4
              lg:min-w-56
            "
          >
            <p
              className="
                text-xs font-semibold
                uppercase tracking-wide
                text-slate-500
              "
            >
              Presupuesto estimado
            </p>

            <p
              className="
                mt-2 text-xl font-bold
                text-slate-950
              "
            >
              {new Intl.NumberFormat(
                "es-MX",
                {
                  style: "currency",
                  currency: "MXN",
                  minimumFractionDigits: 2,
                },
              ).format(
                Number(
                  trip.estimated_budget ?? 0,
                ),
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}