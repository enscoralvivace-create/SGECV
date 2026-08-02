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
          "repertoire.view",
          "repertoire.manage",
      ]}
      match="any"
    >
      {children}
    </PermissionPage>
  );
}
