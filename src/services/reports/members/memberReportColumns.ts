import type {
  ReportColumn,
} from "@/types/report";

import type {
  MemberReportRow,
} from "@/types/memberReport";

export const memberReportColumns:
ReportColumn<MemberReportRow>[] = [
  {
    key: "fullName",
    header: "Integrante",
    align: "left",
  },
  {
    key: "voice",
    header: "Voz / función",
    align: "left",
  },
  {
    key: "status",
    header: "Estado",
    align: "center",
  },
  {
    key: "email",
    header: "Correo electrónico",
    align: "left",
  },
  {
    key: "phone",
    header: "Teléfono",
    align: "left",
  },
  {
    key: "joinDate",
    header: "Fecha de ingreso",
    align: "center",
  },
];