"use client";

import type {
  ComponentProps,
} from "react";

import VivaceButton from "@/components/ui/VivaceButton";

import useUserAccess from "@/hooks/useUserAccess";

import type {
  AppPermission,
  AppRole,
} from "@/types/accessControl";

interface PermissionButtonProps
  extends ComponentProps<
    typeof VivaceButton
  > {
  permissions?:
    AppPermission[];
  roles?: AppRole[];
  match?: "all" | "any";
  hideWhenDenied?: boolean;
}

function matchesValues<T>(
  current: T[],
  required: T[],
  match: "all" | "any",
): boolean {
  if (
    required.length === 0
  ) {
    return true;
  }

  if (match === "all") {
    return required.every(
      (value) =>
        current.includes(value),
    );
  }

  return required.some(
    (value) =>
      current.includes(value),
  );
}

export default function PermissionButton({
  permissions = [],
  roles = [],
  match = "all",
  hideWhenDenied = true,
  disabled,
  ...buttonProps
}: PermissionButtonProps) {
  const {
    access,
    isLoading,
  } = useUserAccess();

  const hasPermissions =
    matchesValues(
      access?.permissions ?? [],
      permissions,
      match,
    );

  const hasRoles =
    matchesValues(
      access?.roles ?? [],
      roles,
      match,
    );

  const isAllowed =
    Boolean(access?.isActive) &&
    hasPermissions &&
    hasRoles;

  if (
    !isLoading &&
    !isAllowed &&
    hideWhenDenied
  ) {
    return null;
  }

  return (
    <VivaceButton
      {...buttonProps}
      disabled={
        disabled ||
        isLoading ||
        !isAllowed
      }
    />
  );
}
