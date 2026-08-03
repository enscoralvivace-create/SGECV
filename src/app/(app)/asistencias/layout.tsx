"use client";

import type {
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import PermissionPage from "@/components/auth/PermissionPage";

interface ProtectedModuleLayoutProps {
  children: ReactNode;
}

export default function ProtectedModuleLayout({
  children,
}: Readonly<ProtectedModuleLayoutProps>) {
  const pathname = usePathname();
  const isPersonalRegistration =
    pathname === "/asistencias/registrar";

  return (
    <PermissionPage
      permissions={isPersonalRegistration
        ? [
          "attendance.viewOwn",
          "attendance.viewAll",
          "attendance.manage",
        ]
        : [
          "attendance.viewAll",
          "attendance.manage",
        ]}
      match="any"
    >
      {children}
    </PermissionPage>
  );
}
