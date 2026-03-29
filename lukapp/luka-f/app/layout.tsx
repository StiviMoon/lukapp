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
    { media: "(prefers-color-scheme: dark)",  color: "#0c0c0e" },
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
        <div className="fixed inset-0 bg-background" style={{ zIndex: 0 }} />

        {/* ── Capa 1: figuras lineales eco del isotipo ── */}
        <svg
          aria-hidden="true"
          style={{ zIndex: 1 }}
          className="pointer-events-none fixed inset-0 w-full h-full"
          viewBox="0 0 390 844"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradiente principal del isotipo: morado → azul → lima */}
            <linearGradient id="lg-main" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#5913ef" stopOpacity="0.55" />
              <stop offset="50%"  stopColor="#5295fe" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#baea0f" stopOpacity="0.30" />
            </linearGradient>
            <linearGradient id="lg-inv" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#baea0f" stopOpacity="0.25" />
              <stop offset="50%"  stopColor="#5295fe" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5913ef" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="lg-blue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#5913ef" stopOpacity="0.40" />
              <stop offset="100%" stopColor="#5295fe" stopOpacity="0.20" />
            </linearGradient>
          </defs>

          {/* ── Círculo grande superior izquierdo (eco del círculo del isotipo) ── */}
          <circle
            cx="-20" cy="100" r="190"
            fill="none" stroke="url(#lg-main)" strokeWidth="3.5"
          />
          <circle
            cx="-20" cy="100" r="130"
            fill="none" stroke="url(#lg-main)" strokeWidth="2"
          />

          {/* ── Curva fluida superior ── */}
          <path
            d="M -20 0 C 40 40, 120 10, 200 55 C 265 92, 330 65, 390 95"
            fill="none" stroke="url(#lg-main)" strokeWidth="3"
          />

          {/* ── Círculo grande inferior derecho ── */}
          <circle
            cx="420" cy="760" r="180"
            fill="none" stroke="url(#lg-inv)" strokeWidth="3.5"
          />
          <circle
            cx="420" cy="760" r="110"
            fill="none" stroke="url(#lg-inv)" strokeWidth="2"
          />

          {/* ── Curva fluida inferior ── */}
          <path
            d="M 0 844 C 60 800, 160 830, 240 790 C 310 758, 370 780, 390 760"
            fill="none" stroke="url(#lg-inv)" strokeWidth="3"
          />

          {/* ── Arco lateral derecho ── */}
          <path
            d="M 390 200 C 340 280, 360 380, 390 440"
            fill="none" stroke="url(#lg-blue)" strokeWidth="3"
          />
          <path
            d="M 390 220 C 320 310, 345 410, 390 470"
            fill="none" stroke="url(#lg-blue)" strokeWidth="2"
          />
        </svg>

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
