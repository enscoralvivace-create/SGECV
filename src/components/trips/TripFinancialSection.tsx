"use client";

interface TripFinancialSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function TripFinancialSection({
  title,
  description,
  children,
  actions,
}: TripFinancialSectionProps) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
      "
    >
      <header
        className="
          mb-6
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-start
          md:justify-between
        "
      >
        <div>
          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            {title}
          </h2>

          {description ? (
            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {description}
            </p>
          ) : null}
        </div>

        {actions}
      </header>

      {children}
    </section>
  );
}