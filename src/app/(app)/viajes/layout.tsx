"use client";

import type {
  ReactNode,
} from "react";

import PermissionPage from "@/components/auth/PermissionPage";

interface ProtectedModuleLayoutProps {
  children: ReactNode;
}

export default function ProtectedModuleLayout({
  children,
}: Readonly<ProtectedModuleLayoutProps>) {
  return (
    <PermissionPage
      permissions={[
          "trips.viewOwn",
          "trips.viewAll",
          "trips.manage",
      ]}
      match="any"
    >
      {children}
    </PermissionPage>
  );
}
