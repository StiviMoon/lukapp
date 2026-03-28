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
  themeColor: "#5913ef",
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
