"use client";

import { useRef, useState, useCallback } from "react";

interface UseVoiceRecognitionOptions {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
}

interface UseVoiceRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

const SILENCE_THRESHOLD = 8;   // amplitud promedio mínima para considerar "voz"
const SILENCE_DELAY_MS  = 1500; // ms de silencio antes de procesar automáticamente
const MIN_RECORD_MS     = 800;  // no auto-parar antes de este tiempo

export function useVoiceRecognition({
  onInterim,
  onFinal,
  onError,
}: UseVoiceRecognitionOptions): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);

  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const chunksRef         = useRef<Blob[]>([]);
  const streamRef         = useRef<MediaStream | null>(null);
  const audioCtxRef       = useRef<AudioContext | null>(null);
  const silenceTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartRef    = useRef<number>(0);
  const hasVoiceRef       = useRef(false); // se detectó voz al menos una vez

  const onFinalRef   = useRef(onFinal);
  const onInterimRef = useRef(onInterim);
  const onErrorRef   = useRef(onError);
  onFinalRef.current   = onFinal;
  onInterimRef.current = onInterim;
  onErrorRef.current   = onError;

  const isSupported =
    typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  // Limpia todos los timers/intervals de detección de silencio
  const clearSilenceDetection = useCallback(() => {
    if (silenceTimerRef.current)     clearTimeout(silenceTimerRef.current);
    if (analyserIntervalRef.current) clearInterval(analyserIntervalRef.current);
    silenceTimerRef.current     = null;
    analyserIntervalRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceDetection();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  }, [clearSilenceDetection]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      onErrorRef.current("Tu navegador no soporta grabación de audio.");
      return;
    }

    chunksRef.current = [];
    hasVoiceRef.current = false;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      onErrorRef.current("Permiso de micrófono denegado. Permite el acceso en tu navegador.");
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/ogg";

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      clearSilenceDetection();
      setIsListening(false);
      stream.getTracks().forEach((t) => t.stop());

      const audioBlob = new Blob(chunksRef.current, { type: mimeType });
      chunksRef.current = [];

      if (audioBlob.size < 1000) {
        onErrorRef.current("No escuché nada, intenta de nuevo.");
        return;
      }

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const response = await fetch(`${API_BASE}/voice/transcribe`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          onErrorRef.current(result.error?.message ?? "Error al transcribir el audio.");
          return;
        }

        const transcript: string = result.data?.transcript ?? "";
        if (!transcript.trim()) {
          onErrorRef.current("No se detectó texto en el audio.");
          return;
        }

        onFinalRef.current(transcript.trim());
      } catch {
        onErrorRef.current("Error de conexión al procesar el audio.");
      }
    };

    mediaRecorder.start();
    recordStartRef.current = Date.now();
    setIsListening(true);

    // ── Detección de silencio con Web Audio API ────────────────────────────
    try {
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      analyserIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const elapsed = Date.now() - recordStartRef.current;

        if (avg > SILENCE_THRESHOLD) {
          // Hay voz — limpiar el timer de silencio
          hasVoiceRef.current = true;
          onInterimRef.current("escuchando...");
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (hasVoiceRef.current && elapsed > MIN_RECORD_MS && !silenceTimerRef.current) {
          // Hubo voz antes y ahora hay silencio → iniciar cuenta regresiva
          silenceTimerRef.current = setTimeout(() => {
            // Auto-stop: el usuario dejó de hablar
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
          }, SILENCE_DELAY_MS);
        }
      }, 100);
    } catch {
      // Si Web Audio API falla (e.g. Safari), solo mostrar "..." como antes
      analyserIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          onInterimRef.current("...");
        }
      }, 1000);
    }
  }, [isSupported, clearSilenceDetection]);

  return { isSupported, isListening, startListening, stopListening };
}
