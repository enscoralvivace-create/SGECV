import type {
  ReactNode,
} from "react";

import AppAccessGuard from "@/components/auth/AppAccessGuard";
import AppMobileNavigation from "@/components/layout/AppMobileNavigation";
import AppSidebar from "@/components/layout/AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <AppAccessGuard>
      <div className="min-h-screen bg-slate-50 lg:flex">
        <AppSidebar />

        <div className="min-w-0 flex-1">
          <AppMobileNavigation />

          <div className="pb-24 lg:pb-0">
            {children}
          </div>
        </div>
      </div>
    </AppAccessGuard>
  );
}