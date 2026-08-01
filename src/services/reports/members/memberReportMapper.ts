import type {
  Member,
} from "@/types/member";

import type {
  MemberReportRow,
} from "@/types/memberReport";

function formatOptionalValue(
  value: string | null | undefined,
): string {
  const normalizedValue = value?.trim();

  return normalizedValue || "No registrado";
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "No registrada";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

function buildFullName(
  member: Member,
): string {
  return [
    member.name.trim(),
    member.last_name.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

export function mapMemberToReportRow(
  member: Member,
): MemberReportRow {
  return {
    id: member.id,
    fullName: buildFullName(member),
    voice: member.voice,
    status: member.status,
    email: formatOptionalValue(member.email),
    phone: formatOptionalValue(member.phone),
    joinDate: formatDate(member.join_date),
  };
}

export function mapMembersToReportRows(
  members: Member[],
): MemberReportRow[] {
  return members.map(mapMemberToReportRow);
}