import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Syne, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppChrome } from "../components/app-chrome";
import { PwaRegister } from "@/components/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  themeColor: "#6600FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "lukapp — Maneja tus lukas. Control, claridad, crecimiento.",
  description:
    "Tus gastos, tus inversiones, tu plata. Una app para tener el control y crecer financieramente — solo o con tu pareja.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lukapp",
  },
  icons: {
    apple: "/icons/icon-180.png",
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
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${syne.variable} ${spaceMono.variable} antialiased`}
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
