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
  usingNativeApi: boolean; // true = Web Speech API (browser), false = Whisper fallback
  startListening: () => void;
  stopListening: () => void;
}

// Constantes solo para el fallback Whisper
// SpeechRecognition no siempre está en el scope de tipos DOM en Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

const CALIBRATION_MS    = 300;
const SILENCE_MARGIN    = 12;
const SILENCE_DELAY_MS  = 2000;
const MIN_RECORD_MS     = 1000;
const VOICE_HISTORY_LEN = 5;

function mapSpeechError(error: string): string {
  switch (error) {
    case "not-allowed":
    case "permission-denied":
      return "Permiso de micrófono denegado. Permite el acceso en tu navegador.";
    case "no-speech":
      return "No escuché nada, intenta de nuevo.";
    case "network":
      return "Error de red al transcribir. Verifica tu conexión.";
    case "audio-capture":
      return "No se encontró micrófono en tu dispositivo.";
    default:
      return "Error de reconocimiento de voz, intenta de nuevo.";
  }
}

export function useVoiceRecognition({
  onInterim,
  onFinal,
  onError,
}: UseVoiceRecognitionOptions): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);

  // Refs para Web Speech API
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Refs para fallback Whisper
  const mediaRecorderRef    = useRef<MediaRecorder | null>(null);
  const chunksRef           = useRef<Blob[]>([]);
  const streamRef           = useRef<MediaStream | null>(null);
  const audioCtxRef         = useRef<AudioContext | null>(null);
  const silenceTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartRef      = useRef<number>(0);
  const hasVoiceRef         = useRef(false);
  const adaptiveThresholdRef  = useRef<number>(8);
  const voiceHistoryRef       = useRef<number[]>([]);
  const calibrationSamplesRef = useRef<number[]>([]);

  const onFinalRef   = useRef(onFinal);
  const onInterimRef = useRef(onInterim);
  const onErrorRef   = useRef(onError);
  onFinalRef.current   = onFinal;
  onInterimRef.current = onInterim;
  onErrorRef.current   = onError;

  // Detectar soporte de Web Speech API (Chrome, Edge, Android Chrome) — ref para estabilidad
  const speechAPIRef = useRef<(new () => SpeechRecognitionInstance) | null>(
    typeof window !== "undefined"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null)
      : null
  );

  const isSupported =
    typeof window !== "undefined" &&
    (!!speechAPIRef.current || !!navigator.mediaDevices?.getUserMedia);

  // ── Cleanup fallback Whisper ───────────────────────────────────────────────
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

  // ── Stop (ambos modos) ─────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    // Web Speech API
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    // Fallback Whisper
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

  // ── Fallback: Whisper via Groq ─────────────────────────────────────────────
  const startWhisperListening = useCallback(async () => {
    chunksRef.current = [];
    hasVoiceRef.current = false;
    voiceHistoryRef.current = [];
    calibrationSamplesRef.current = [];
    adaptiveThresholdRef.current = 8;

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

        const MAX_ATTEMPTS = 2;
        let lastError: string | null = null;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            if (attempt > 1) {
              onInterimRef.current(`Reintentando (${attempt}/${MAX_ATTEMPTS})...`);
              await new Promise((r) => setTimeout(r, 1000 * (attempt - 1)));
            }

            const response = await fetch(`${API_BASE}/voice/transcribe`, {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
              lastError = result.error?.message ?? "Error al transcribir el audio.";
              continue;
            }

            const transcript: string = result.data?.transcript ?? "";
            if (!transcript.trim()) {
              onErrorRef.current("No se detectó texto en el audio.");
              return;
            }

            onFinalRef.current(transcript.trim());
            return;
          } catch {
            lastError = "Error de conexión al procesar el audio.";
          }
        }

        onErrorRef.current(lastError ?? "Error al transcribir el audio.");
      } catch {
        onErrorRef.current("Error de conexión al procesar el audio.");
      }
    };

    mediaRecorder.start();
    recordStartRef.current = Date.now();
    setIsListening(true);

    // Detección de silencio adaptativa
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

        if (elapsed < CALIBRATION_MS) {
          calibrationSamplesRef.current.push(avg);
          if (elapsed >= CALIBRATION_MS - 100) {
            const samples = calibrationSamplesRef.current;
            if (samples.length > 0) {
              const sorted = [...samples].sort((a, b) => a - b);
              const p90 = sorted[Math.floor(0.9 * sorted.length)] ?? 0;
              adaptiveThresholdRef.current = Math.max(8, p90 + SILENCE_MARGIN);
            }
          }
          return;
        }

        voiceHistoryRef.current = [
          ...voiceHistoryRef.current.slice(-(VOICE_HISTORY_LEN - 1)),
          avg,
        ];
        const historyAvg =
          voiceHistoryRef.current.reduce((a, b) => a + b, 0) /
          (voiceHistoryRef.current.length || 1);

        if (historyAvg > adaptiveThresholdRef.current) {
          hasVoiceRef.current = true;
          onInterimRef.current("escuchando...");
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (
          hasVoiceRef.current &&
          elapsed > MIN_RECORD_MS &&
          !silenceTimerRef.current
        ) {
          silenceTimerRef.current = setTimeout(() => {
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
          }, SILENCE_DELAY_MS);
        }
      }, 100);
    } catch {
      analyserIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          onInterimRef.current("...");
        }
      }, 1000);
    }
  }, [clearSilenceDetection]);

  // ── Modo principal: Web Speech API ────────────────────────────────────────
  const startListening = useCallback(async () => {
    if (!isSupported) {
      onErrorRef.current("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    if (speechAPIRef.current) {
      // ── Web Speech API (Chrome, Edge, Android Chrome) — 0 tokens ──────────
      const recognition = new speechAPIRef.current();
      recognition.lang = "es-CO";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      recognitionRef.current = recognition;

      let hasFinalResult = false;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transcript = Array.from(event.results as any[])
          .map((r: any) => r[0].transcript)
          .join(" ");
        const isFinal = event.results[event.results.length - 1].isFinal;
        if (isFinal) {
          hasFinalResult = true;
          onFinalRef.current(transcript.trim());
        } else {
          onInterimRef.current(transcript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false);
        recognitionRef.current = null;
        onErrorRef.current(mapSpeechError(event.error));
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        // Si se detuvo sin resultado final (usuario tocó Enviar sin haber hablado)
        if (!hasFinalResult) {
          onErrorRef.current("No escuché nada, intenta de nuevo.");
        }
      };

      recognition.start();
      setIsListening(true);
    } else {
      // ── Fallback: Whisper via Groq (Firefox, Safari sin soporte) ──────────
      await startWhisperListening();
    }
  }, [isSupported, startWhisperListening]);

  return {
    isSupported,
    isListening,
    usingNativeApi: !!speechAPIRef.current,
    startListening,
    stopListening,
  };
}
