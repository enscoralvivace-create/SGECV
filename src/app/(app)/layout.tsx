import type {
  ReactNode,
} from "react";

import AppAccessGuard from "@/components/auth/AppAccessGuard";
import AppMobileNavigation from "@/components/layout/AppMobileNavigation";
import AppSidebar from "@/components/layout/AppSidebar";
import VivaceOnboardingProvider from "@/components/onboarding/VivaceOnboardingProvider";
import PersonalGreetingProvider from "@/components/personalization/PersonalGreetingProvider";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: Readonly<AppLayoutProps>) {
  return (
    <AppAccessGuard>
      <VivaceOnboardingProvider>
        <PersonalGreetingProvider>
          <div className="min-safe-screen bg-slate-50 lg:flex">
            <AppSidebar />

            <div className="min-w-0 flex-1">
              <AppMobileNavigation />

              <main className="min-h-dvh min-w-0 overflow-x-hidden pb-[calc(5rem+var(--safe-bottom))] lg:min-h-screen lg:pb-0">
                {children}
              </main>
            </div>
          </div>
        </PersonalGreetingProvider>
      </VivaceOnboardingProvider>
    </AppAccessGuard>
  );
}
