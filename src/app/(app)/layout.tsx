import type {
  ReactNode,
} from "react";

import AppMobileNavigation from "@/components/layout/AppMobileNavigation";
import AppSidebar from "@/components/layout/AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: Readonly<AppLayoutProps>) {
  return (
    <div className="min-safe-screen bg-slate-50 lg:flex">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <AppMobileNavigation />

        <div className="min-h-dvh pb-[calc(5rem+var(--safe-bottom))] lg:min-h-screen lg:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
