"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

const VoiceModal = dynamic(
  () => import("@/components/voice/VoiceModal").then(m => m.VoiceModal),
  { ssr: false },
);

const GlobalAddTransactionSheet = dynamic(
  () => import("@/components/transactions/AddTransactionSheet").then(m => m.GlobalAddTransactionSheet),
  { ssr: false },
);

export function AppChrome() {
  return (
    <>
      <Navbar />
      <Toaster />
      <VoiceModal />
      <GlobalAddTransactionSheet />
      <LoadingOverlay />
      <PwaInstallBanner />
    </>
  );
}

