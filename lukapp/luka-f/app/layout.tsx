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
      </body>
    </html>
  );
}
