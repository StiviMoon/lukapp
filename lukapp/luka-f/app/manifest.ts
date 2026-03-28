import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "lukapp — Tus lukas. Tu control.",
    short_name: "lukapp",
    description: "Gastos, inversiones y claridad en una app. Crece financieramente — solo o con tu pareja.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0c0c0e",
    theme_color: "#5913ef",
    orientation: "portrait-primary",
    lang: "es",
    categories: ["finance", "productivity"],
    shortcuts: [
      {
        name: "Registrar gasto",
        short_name: "Gasto",
        description: "Abre el registro de gastos rápido",
        url: "/dashboard?action=expense",
        icons: [{ src: "/icons/icon-144.png", sizes: "144x144" }],
      },
      {
        name: "Ver analíticas",
        short_name: "Analíticas",
        url: "/analytics",
        icons: [{ src: "/icons/icon-144.png", sizes: "144x144" }],
      },
    ],
    icons: [
      { src: "/icons/icon-48.png",           sizes: "48x48",   type: "image/png" },
      { src: "/icons/icon-144.png",          sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-192.png",          sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png",          sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
