"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

export function useInactivityTimeout() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  }, [supabase, router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleSignOut, TIMEOUT_MS);
  }, [handleSignOut]);

  useEffect(() => {
    resetTimer();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [resetTimer]);
}
