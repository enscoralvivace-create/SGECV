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
          "roles.manage",
          "settings.manage",
      ]}
      match="any"
    >
      {children}
    </PermissionPage>
  );
}
