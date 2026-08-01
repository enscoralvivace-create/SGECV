import type {
  Member,
  MemberStatus,
  MemberVoice,
} from "@/types/member";

import type {
  MemberReportSummary,
  MemberStatusSummary,
  MemberVoiceSummary,
} from "@/types/memberReport";

const MEMBER_STATUS_ORDER: MemberStatus[] = [
  "Activo",
  "Permiso temporal",
  "Inactivo",
  "Baja definitiva",
];

const MEMBER_VOICE_ORDER: MemberVoice[] = [
  "Soprano",
  "Contralto",
  "Tenor",
  "Bajo",
  "Director",
  "Pianista",
  "Administración",
  "Otra",
];

function calculatePercentage(
  value: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Number(
    ((value / total) * 100).toFixed(2),
  );
}

function countMembersByStatus(
  members: Member[],
  status: MemberStatus,
): number {
  return members.filter(
    (member) => member.status === status,
  ).length;
}

function countMembersByVoice(
  members: Member[],
  voice: MemberVoice,
): number {
  return members.filter(
    (member) => member.voice === voice,
  ).length;
}

export function buildMemberVoiceSummary(
  members: Member[],
): MemberVoiceSummary[] {
  return MEMBER_VOICE_ORDER.map(
    (voice) => {
      const total = countMembersByVoice(
        members,
        voice,
      );

      return {
        voice,
        total,
        percentage: calculatePercentage(
          total,
          members.length,
        ),
      };
    },
  ).filter(
    (summary) => summary.total > 0,
  );
}

export function buildMemberStatusSummary(
  members: Member[],
): MemberStatusSummary[] {
  return MEMBER_STATUS_ORDER.map(
    (status) => {
      const total = countMembersByStatus(
        members,
        status,
      );

      return {
        status,
        total,
        percentage: calculatePercentage(
          total,
          members.length,
        ),
      };
    },
  );
}

export function buildMemberReportSummary(
  members: Member[],
): MemberReportSummary {
  const totalMembers = members.length;

  const activeMembers = countMembersByStatus(
    members,
    "Activo",
  );

  const temporaryLeaveMembers =
    countMembersByStatus(
      members,
      "Permiso temporal",
    );

  const inactiveMembers =
    countMembersByStatus(
      members,
      "Inactivo",
    );

  const permanentlyInactiveMembers =
    countMembersByStatus(
      members,
      "Baja definitiva",
    );

  return {
    totalMembers,
    activeMembers,
    temporaryLeaveMembers,
    inactiveMembers,
    permanentlyInactiveMembers,
    activePercentage: calculatePercentage(
      activeMembers,
      totalMembers,
    ),
    voices: buildMemberVoiceSummary(members),
    statuses: buildMemberStatusSummary(members),
  };
}