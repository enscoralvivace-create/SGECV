"use client";

import {
  BadgeCheck,
  CircleGauge,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";

import type {
  TripFinancialReconciliation,
} from "@/hooks/useTripFinancialDashboard";

import type {
  TripParticipantFinancialSummary,
} from "@/types/tripFinancial";

import {
  calculateTripFinancialHealth,
  type TripFinancialHealthLevel,
} from "@/utils/tripFinancialHealth";

interface TripFinancialHealthCardProps {
  reconciliation:
    TripFinancialReconciliation;

  participants:
    TripParticipantFinancialSummary[];
}

function getLevelClasses(
  level: TripFinancialHealthLevel,
): string {
  switch (level) {
    case "excellent":
      return (
        "border-emerald-200 " +
        "bg-emerald-50 " +
        "text-emerald-950"
      );

    case "good":
      return (
        "border-sky-200 " +
        "bg-sky-50 " +
        "text-sky-950"
      );

    case "attention":
      return (
        "border-amber-200 " +
        "bg-amber-50 " +
        "text-amber-950"
      );

    case "critical":
      return (
        "border-rose-200 " +
        "bg-rose-50 " +
        "text-rose-950"
      );
  }
}

function getProgressClasses(
  level: TripFinancialHealthLevel,
): string {
  switch (level) {
    case "excellent":
      return "bg-emerald-600";

    case "good":
      return "bg-sky-600";

    case "attention":
      return "bg-amber-500";

    case "critical":
      return "bg-rose-600";
  }
}

function HealthIcon({
  level,
}: {
  level: TripFinancialHealthLevel;
}) {
  const iconClasses =
    "h-6 w-6";

  switch (level) {
    case "excellent":
      return (
        <BadgeCheck
          aria-hidden="true"
          className={iconClasses}
        />
      );

    case "good":
      return (
        <CircleGauge
          aria-hidden="true"
          className={iconClasses}
        />
      );

    case "attention":
      return (
        <TriangleAlert
          aria-hidden="true"
          className={iconClasses}
        />
      );

    case "critical":
      return (
        <ShieldAlert
          aria-hidden="true"
          className={iconClasses}
        />
      );
  }
}

export default function TripFinancialHealthCard({
  reconciliation,
  participants,
}: TripFinancialHealthCardProps) {
  const health =
    calculateTripFinancialHealth(
      reconciliation,
      participants,
    );

  return (
    <section
      aria-labelledby="trip-financial-health-title"
      className={`
        rounded-2xl
        border
        p-5
        shadow-sm
        ${getLevelClasses(health.level)}
      `}
    >
      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div className="max-w-2xl">
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white/70
              "
            >
              <HealthIcon
                level={health.level}
              />
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  opacity-70
                "
              >
                Salud financiera
              </p>

              <h3
                id="trip-financial-health-title"
                className="
                  text-2xl
                  font-bold
                "
              >
                {health.label}
              </h3>
            </div>
          </div>

          <p
            className="
              mt-4
              text-sm
              leading-6
              opacity-80
            "
          >
            {health.summary}
          </p>
        </div>

        <div
          className="
            min-w-48
            rounded-xl
            bg-white/70
            p-4
          "
        >
          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <span
              className="
                text-sm
                font-medium
                opacity-70
              "
            >
              Puntaje
            </span>

            <strong
              className="
                text-3xl
                font-bold
              "
            >
              {health.score}
              <span
                className="
                  text-base
                  font-semibold
                  opacity-60
                "
              >
                /100
              </span>
            </strong>
          </div>

          <div
            aria-label={`Puntaje financiero: ${health.score} de 100`}
            className="
              mt-3
              h-2
              overflow-hidden
              rounded-full
              bg-slate-200
            "
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={health.score}
          >
            <div
              className={`
                h-full
                rounded-full
                transition-all
                ${getProgressClasses(
                  health.level,
                )}
              `}
              style={{
                width: `${health.score}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="
          mt-5
          grid
          gap-4
          lg:grid-cols-2
        "
      >
        <div
          className="
            rounded-xl
            bg-white/70
            p-4
          "
        >
          <h4 className="font-semibold">
            Factores principales
          </h4>

          <ul
            className="
              mt-3
              space-y-2
              text-sm
              leading-5
              opacity-80
            "
          >
            {health.factors.map(
              (factor) => (
                <li
                  key={factor}
                  className="
                    flex
                    items-start
                    gap-2
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      mt-2
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-current
                    "
                  />

                  <span>{factor}</span>
                </li>
              ),
            )}
          </ul>
        </div>

        <div
          className="
            rounded-xl
            bg-white/70
            p-4
          "
        >
          <h4 className="font-semibold">
            Recomendaciones
          </h4>

          <ul
            className="
              mt-3
              space-y-2
              text-sm
              leading-5
              opacity-80
            "
          >
            {health.recommendations.map(
              (recommendation) => (
                <li
                  key={recommendation}
                  className="
                    flex
                    items-start
                    gap-2
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      mt-2
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-current
                    "
                  />

                  <span>
                    {recommendation}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}