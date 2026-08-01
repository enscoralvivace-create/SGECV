export function formatReportCurrency(
  value: number,
  currency = "MXN",
  locale = "es-MX",
): string {
  return new Intl.NumberFormat(
    locale,
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    },
  ).format(value);
}

export function formatReportPercentage(
  value: number,
  fractionDigits = 2,
): string {
  if (!Number.isFinite(value)) {
    return `0.${"0".repeat(
      fractionDigits,
    )}%`;
  }

  return `${value.toFixed(
    fractionDigits,
  )}%`;
}

export function calculateReportPercentage(
  value: number,
  total: number,
  fractionDigits = 2,
): number {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(total) ||
    total <= 0
  ) {
    return 0;
  }

  return Number(
    ((value / total) * 100).toFixed(
      fractionDigits,
    ),
  );
}

export function formatReportDate(
  value: string | null | undefined,
  locale = "es-MX",
): string {
  if (!value) {
    return "No registrada";
  }

  const normalizedValue =
    value.includes("T")
      ? value
      : `${value}T00:00:00`;

  const date =
    new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    locale,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

export function formatReportDateTime(
  value: string,
  locale = "es-MX",
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    locale,
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(date);
}

export function formatReportOptionalValue(
  value: string | null | undefined,
  fallback = "No registrado",
): string {
  const normalizedValue =
    value?.trim();

  return normalizedValue || fallback;
}

export function formatReportSignedCurrency(
  value: number,
  currency = "MXN",
  locale = "es-MX",
): string {
  const formattedValue =
    formatReportCurrency(
      value,
      currency,
      locale,
    );

  if (value > 0) {
    return `+${formattedValue}`;
  }

  return formattedValue;
}