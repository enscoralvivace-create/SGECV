import type {
  MetadataRoute,
} from "next";

export default function manifest():
MetadataRoute.Manifest {
  return {
    name:
      "Vivace Suite — Ensamble Coral Vivace",
    short_name:
      "Vivace Suite",
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
      "music",
      "productivity",
    ],
    lang: "es-MX",
    icons: [
      {
        src:
          "/images/logo-ecv-v2.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}