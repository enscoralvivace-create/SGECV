import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string | number;
  emptyState?: ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyState,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <>
        {emptyState ?? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            No hay información disponible.
          </div>
        )}
      </>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={[
                  "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
                  column.className ?? "",
                ].join(" ")}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((item) => (
            <tr
              key={getRowKey(item)}
              className="transition hover:bg-slate-50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={[
                    "whitespace-nowrap px-5 py-4 text-sm text-slate-700",
                    column.className ?? "",
                  ].join(" ")}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}