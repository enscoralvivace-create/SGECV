"use client";

import type {
  ReactNode,
} from "react";

import VivaceCard from "@/components/ui/VivaceCard";

export interface VivaceTableColumn<
  T extends Record<string, unknown>,
> {
  key: keyof T | string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  render?: (row: T) => ReactNode;
}

interface VivaceTableProps<
  T extends Record<string, unknown>,
> {
  columns: VivaceTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  rowKey: (
    row: T,
  ) => string | number;
}

function getAlignmentClass(
  align:
    | "left"
    | "center"
    | "right"
    | undefined,
): string {
  if (align === "center") {
    return "text-center";
  }

  if (align === "right") {
    return "text-right";
  }

  return "text-left";
}

function getCellValue<
  T extends Record<string, unknown>,
>(
  row: T,
  key: keyof T | string,
): ReactNode {
  const value =
    row[
      key as keyof T
    ];

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return value;
  }

  if (typeof value === "boolean") {
    return value
      ? "Sí"
      : "No";
  }

  return String(value);
}

export default function VivaceTable<
  T extends Record<string, unknown>,
>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No hay registros.",
}: VivaceTableProps<T>) {
  return (
    <VivaceCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {columns.map(
                (column) => (
                  <th
                    key={String(
                      column.key,
                    )}
                    className={[
                      "border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700",
                      getAlignmentClass(
                        column.align,
                      ),
                    ].join(" ")}
                  >
                    {column.header}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length
                  }
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-slate-100 transition hover:bg-emerald-50/40"
                >
                  {columns.map(
                    (column) => (
                      <td
                        key={String(
                          column.key,
                        )}
                        className={[
                          "px-5 py-4 text-sm text-slate-700",
                          getAlignmentClass(
                            column.align,
                          ),
                        ].join(" ")}
                      >
                        {column.render
                          ? column.render(
                              row,
                            )
                          : getCellValue(
                              row,
                              column.key,
                            )}
                      </td>
                    ),
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </VivaceCard>
  );
}