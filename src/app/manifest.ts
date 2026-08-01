import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Vivace Suite",
    short_name: "Vivace",

    description:
      "Sistema integral de gestión del Ensamble Coral Vivace.",

    start_url: "/",

    scope: "/",

    display: "standalone",

    orientation: "portrait",

    background_color: "#f8fafc",

    theme_color: "#064e3b",

    categories: [
      "education",
      "productivity",
      "utilities",
    ],

    lang: "es-MX",

    dir: "ltr",

    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],

    shortcuts: [
      {
        name: "Mi cuenta",
        short_name: "Mi cuenta",
        description:
          "Consultar tu perfil y estadísticas.",
        url: "/mi-cuenta",
        icons: [
          {
            src: "/icon",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Asistencias",
        short_name: "Asistencia",
        description:
          "Registrar asistencia mediante código QR.",
        url: "/asistencias",
        icons: [
          {
            src: "/icon",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Viajes",
        short_name: "Viajes",
        description:
          "Consultar los viajes del ensamble.",
        url: "/viajes",
        icons: [
          {
            src: "/icon",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Repertorio",
        short_name: "Repertorio",
        description:
          "Consultar el repertorio del ensamble.",
        url: "/repertorio",
        icons: [
          {
            src: "/icon",
            sizes: "192x192",
          },
        ],
      },
    ],
  };
}