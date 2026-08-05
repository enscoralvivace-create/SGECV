"use client";

import PilotFeedbackAdminPanel from "@/components/feedback/PilotFeedbackAdminPanel";
import PermissionAdminPanel from "@/components/settings/PermissionAdminPanel";
import useUserAccess from "@/hooks/useUserAccess";

export default function SettingsPage() {
  const { hasPermission } = useUserAccess();

  return (
    <>
      {hasPermission("roles.manage") ? <PermissionAdminPanel /> : null}
      {hasPermission("settings.manage") ? (
        <main className="min-h-screen bg-slate-50 px-4 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <PilotFeedbackAdminPanel />
          </div>
        </main>
      ) : null}
    </>
  );
}
