import type {
  Metadata,
  Viewport,
} from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import PwaConnectionStatus from "@/components/pwa/PwaConnectionStatus";
import PwaDisplayModeSync from "@/components/pwa/PwaDisplayModeSync";
import PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt";
import PwaUpdatePrompt from "@/components/pwa/PwaUpdatePrompt";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Vivace Suite",
  title: {
    default: "Vivace Suite",
    template: "%s | Vivace Suite",
  },
  description:
    "Sistema integral de gestión del Ensamble Coral Vivace.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vivace Suite",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      lang="es-MX"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ServiceWorkerRegistration />
        <PwaDisplayModeSync />

        {children}

        <PwaConnectionStatus />
        <PwaInstallPrompt />
        <PwaUpdatePrompt />
      </body>
    </html>
  );
}