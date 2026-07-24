import type { ReactNode } from "react";
import AppSidebar from "@/components/layout/AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}