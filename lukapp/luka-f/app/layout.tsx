import type { Metadata, Viewport } from "next";
import { Poppins, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppChrome } from "../components/app-chrome";
import { PwaRegister } from "@/components/PwaRegister";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#10062e" },
    { media: "(prefers-color-scheme: light)", color: "#f4f4f4" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // clave para safe-area en iPhone con notch
};

export const metadata: Metadata = {
  title: "lukapp — Tus lukas. Tu control.",
  description:
    "Gastos, inversiones y claridad en una app. Crece financieramente — solo o con tu pareja.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "lukapp",
    startupImage: [
      { url: "/icons/splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/icons/splash-1284x2778.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" },
    ],
  },
  icons: {
    apple: [
      { url: "/icons/icon-120.png", sizes: "120x120" },
      { url: "/icons/icon-152.png", sizes: "152x152" },
      { url: "/icons/icon-167.png", sizes: "167x167" },
      { url: "/icons/icon-180.png", sizes: "180x180" },
    ],
    icon: [
      { url: "/icons/icon-48.png",  sizes: "48x48"  },
      { url: "/icons/icon-192.png", sizes: "192x192" },
      { url: "/icons/icon-512.png", sizes: "512x512" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${spaceMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* ── Capa 0: color base ── */}
        <div className="fixed inset-0 bg-background dark:bg-bg" style={{ zIndex: 0 }} />

        {/* ── Capa 1: figuras SVG decorativas (dark mode) ── */}
        <div
          aria-hidden="true"
          style={{ zIndex: 1, position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}
        >
          {/* Variantes light */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figuras/fig1.svg" alt="" className="bg-fig bg-fig-1 bg-fig-light" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figuras/fig2.svg" alt="" className="bg-fig bg-fig-2 bg-fig-light" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figuras/fig3.svg" alt="" className="bg-fig bg-fig-3 bg-fig-light" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figuras/fig4.svg" alt="" className="bg-fig bg-fig-4 bg-fig-light" />
          {/* Variantes dark */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figuras/fig1%20oscuro.svg" alt="" className="bg-fig bg-fig-1 bg-fig-dark" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figuras/Fig2%20oscuro.svg" alt="" className="bg-fig bg-fig-2 bg-fig-dark" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figuras/fig3%20oscuro.svg" alt="" className="bg-fig bg-fig-3 bg-fig-dark" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figuras/fig4%20oscuro.svg" alt="" className="bg-fig bg-fig-4 bg-fig-dark" />
        </div>

        {/* ── Capa 2: todo el contenido de la app ── */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="lukapp-theme"
          >
            <QueryProvider>
              {children}
              <AppChrome />
              <PwaRegister />
            </QueryProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
