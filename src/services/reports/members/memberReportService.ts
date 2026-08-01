import { getMembers } from "@/services/memberService";
import { buildReportMetadata } from "@/services/reportService";

import { mapMembersToReportRows } from "@/services/reports/members/memberReportMapper";
import { buildMemberReportSections } from "@/services/reports/members/memberReportSections";
import { buildMemberReportSummary } from "@/services/reports/members/memberReportSummary";

import type {
  MemberReportData,
  MemberReportRow,
} from "@/types/memberReport";

import type {
  ReportDocument,
} from "@/types/report";

export async function getMemberReportData(): Promise<MemberReportData> {
  const sourceMembers = await getMembers();

  const members =
    mapMembersToReportRows(sourceMembers);

  const summary =
    buildMemberReportSummary(sourceMembers);

  const document: ReportDocument<MemberReportRow> = {
    metadata: buildReportMetadata({
      reportId: "members-general-report",
      title: "Reporte general de integrantes",
      category: "members",
    }),
    sections: buildMemberReportSections(
      members,
      summary,
    ),
  };

  return {
    document,
    summary,
    members,
  };
}