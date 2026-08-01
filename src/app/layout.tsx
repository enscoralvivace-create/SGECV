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
        <a
          href="#contenido-principal"
          className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white shadow-xl transition focus:translate-y-0"
        >
          Saltar al contenido principal
        </a>
        <ServiceWorkerRegistration />
        <PwaDisplayModeSync />

        <div id="contenido-principal" tabIndex={-1}>
          {children}
        </div>

        <PwaConnectionStatus />
        <PwaInstallPrompt />
        <PwaUpdatePrompt />
      </body>
    </html>
  );
}