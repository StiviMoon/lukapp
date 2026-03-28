import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lukapp",
    short_name: "Lukapp",
    description: "Tus finanzas, en orden.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4f4f4",
    theme_color: "#5913ef",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
