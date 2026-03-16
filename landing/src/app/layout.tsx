import type { Metadata } from "next";
import { Outfit, Syne, Space_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/contexts/ThemeContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "lukapp — Tu plata y la de tu pareja en una app",
  description:
    "Maneja tu dinero y las finanzas compartidas con tu pareja. Sin hojas de cálculo: claridad para vos y para los dos.",
  keywords: ["finanzas", "pareja", "app", "presupuesto", "finanzas compartidas", "dinero", "Colombia"],
  authors: [{ name: "Steven" }],
  openGraph: {
    title: "lukapp — Tu plata y la de tu pareja en una app",
    description:
      "Maneja tu dinero y las finanzas compartidas. Claridad para vos y para los dos.",
    url: "https://lukapp.co",
    siteName: "lukapp",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "lukapp — Tu plata y la de tu pareja en una app",
    description: "Maneja tu dinero y las finanzas compartidas. Claridad para vos y para los dos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('lukapp-theme');document.documentElement.classList.toggle('dark',t!=='light');})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          outfit.variable,
          syne.variable,
          spaceMono.variable,
          "font-sans min-h-screen antialiased"
        )}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
