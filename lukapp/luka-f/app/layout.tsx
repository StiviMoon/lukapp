import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Syne, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { VoiceModal } from "@/components/voice/VoiceModal";
import { Navbar } from "@/components/navbar";
import { GlobalAddTransactionSheet } from "@/components/transactions/AddTransactionSheet";

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

export const metadata: Metadata = {
  title: "lukapp — Maneja tus lukas. Control, claridad, crecimiento.",
  description:
    "Tus gastos, tus inversiones, tu plata. Una app para tener el control y crecer financieramente — solo o con tu pareja.",
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
            <Navbar />
            <Toaster />
            <VoiceModal />
            <GlobalAddTransactionSheet />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
