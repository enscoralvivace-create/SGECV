"use client";

import type {
  ReactNode,
} from "react";

import PermissionGuard from "@/components/auth/PermissionGuard";

import type {
  AppPermission,
  AppRole,
} from "@/types/accessControl";

interface PermissionSectionProps {
  children: ReactNode;
  permissions?:
    AppPermission[];
  roles?: AppRole[];
  match?: "all" | "any";
  fallback?: ReactNode;
  className?: string;
}

export default function PermissionSection({
  children,
  permissions = [],
  roles = [],
  match = "all",
  fallback = null,
  className = "",
}: PermissionSectionProps) {
  return (
    <PermissionGuard
      permissions={permissions}
      roles={roles}
      match={match}
      fallback={fallback}
      loadingFallback={null}
    >
      <div className={className}>
        {children}
      </div>
    </PermissionGuard>
  );
}
