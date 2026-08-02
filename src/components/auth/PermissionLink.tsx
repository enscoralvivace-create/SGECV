"use client";

import Link from "next/link";

import type {
  ComponentProps,
} from "react";

import useUserAccess from "@/hooks/useUserAccess";

import type {
  AppPermission,
  AppRole,
} from "@/types/accessControl";

interface PermissionLinkProps
  extends ComponentProps<
    typeof Link
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

export default function PermissionLink({
  permissions = [],
  roles = [],
  match = "all",
  hideWhenDenied = true,
  children,
  ...linkProps
}: PermissionLinkProps) {
  const {
    access,
    isLoading,
  } = useUserAccess();

  const isAllowed =
    Boolean(access?.isActive) &&
    matchesValues(
      access?.permissions ?? [],
      permissions,
      match,
    ) &&
    matchesValues(
      access?.roles ?? [],
      roles,
      match,
    );

  if (
    isLoading ||
    (
      !isAllowed &&
      hideWhenDenied
    )
  ) {
    return null;
  }

  if (!isAllowed) {
    return (
      <span
        aria-disabled="true"
        className={[
          "cursor-not-allowed opacity-50",
          typeof linkProps.className ===
          "string"
            ? linkProps.className
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </span>
    );
  }

  return (
    <Link {...linkProps}>
      {children}
    </Link>
  );
}
