import type {
  AttendanceReportMemberRow,
} from "@/types/attendanceReport";

interface AttendanceMemberTableProps {
  members: AttendanceReportMemberRow[];
}

export default function AttendanceMemberTable({
  members,
}: AttendanceMemberTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Asistencia por integrante
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {members.length}{" "}
          {members.length === 1
            ? "integrante incluido"
            : "integrantes incluidos"}
          .
        </p>
      </div>

      {members.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <TableHeader>
                  Integrante
                </TableHeader>

                <TableHeader>
                  Voz / función
                </TableHeader>

                <TableHeader>
                  Sesiones
                </TableHeader>

                <TableHeader>
                  Presentes
                </TableHeader>

                <TableHeader>
                  Retardos
                </TableHeader>

                <TableHeader>
                  Justificadas
                </TableHeader>

                <TableHeader>
                  Faltas
                </TableHeader>

                <TableHeader>
                  Asistencia
                </TableHeader>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {members.map((member) => (
                <tr
                  key={member.memberId}
                  className="transition hover:bg-slate-50"
                >
                  <TableCell className="font-semibold text-slate-900">
                    {member.memberName}
                  </TableCell>

                  <TableCell>
                    {member.voice}
                  </TableCell>

                  <TableCell>
                    {member.totalSessions}
                  </TableCell>

                  <TableCell>
                    {member.presentCount}
                  </TableCell>

                  <TableCell>
                    {member.lateCount}
                  </TableCell>

                  <TableCell>
                    {member.justifiedCount}
                  </TableCell>

                  <TableCell>
                    {member.absentCount}
                  </TableCell>

                  <TableCell className="font-semibold text-emerald-800">
                    {member.attendancePercentage.toFixed(
                      2,
                    )}
                    %
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-medium text-slate-700">
        No hay integrantes para mostrar.
      </p>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

function TableHeader({
  children,
}: TableHeaderProps) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

function TableCell({
  children,
  className = "",
}: TableCellProps) {
  return (
    <td
      className={`whitespace-nowrap px-6 py-4 text-sm text-slate-600 ${className}`}
    >
      {children}
    </td>
  );
}