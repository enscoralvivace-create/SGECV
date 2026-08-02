"use client";

import type {
  ReactNode,
} from "react";

import PermissionGuard from "@/components/auth/PermissionGuard";

import type {
  AppPermission,
  AppRole,
} from "@/types/accessControl";

interface PermissionPageProps {
  children: ReactNode;
  permissions?:
    AppPermission[];
  roles?: AppRole[];
  match?: "all" | "any";
}

export default function PermissionPage({
  children,
  permissions = [],
  roles = [],
  match = "all",
}: PermissionPageProps) {
  return (
    <PermissionGuard
      permissions={permissions}
      roles={roles}
      match={match}
    >
      {children}
    </PermissionGuard>
  );
}
