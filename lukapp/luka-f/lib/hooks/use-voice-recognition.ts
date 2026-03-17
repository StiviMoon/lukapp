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

/**
 * Hook de grabación de voz usando MediaRecorder (nativo del browser).
 * Graba el audio localmente y lo envía al backend para transcripción con
 * OpenAI Whisper — sin depender de Google ni de ningún servidor externo
 * desde el frontend.
 */
export function useVoiceRecognition({
  onInterim,
  onFinal,
  onError,
}: UseVoiceRecognitionOptions): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // onFinal puede cambiar entre renders; usamos ref para no recrear callbacks
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);
  const onErrorRef = useRef(onError);
  onFinalRef.current = onFinal;
  onInterimRef.current = onInterim;
  onErrorRef.current = onError;

  const isSupported =
    typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      onErrorRef.current("Tu navegador no soporta grabación de audio.");
      return;
    }

    // Limpiar grabación anterior
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      onErrorRef.current(
        "Permiso de micrófono denegado. Permite el acceso en tu navegador."
      );
      return;
    }

    // Elegir el formato de audio compatible con Whisper
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
      setIsListening(false);
      stream.getTracks().forEach((t) => t.stop());

      const audioBlob = new Blob(chunksRef.current, { type: mimeType });
      chunksRef.current = [];

      if (audioBlob.size < 1000) {
        onErrorRef.current("No escuché nada, intenta de nuevo.");
        return;
      }

      // Enviar al backend para transcripción con Whisper
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const API_BASE =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const response = await fetch(`${API_BASE}/voice/transcribe`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          onErrorRef.current(
            result.error?.message ?? "Error al transcribir el audio."
          );
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
    setIsListening(true);

    // Simular texto de escucha activa cada segundo
    const intervalId = setInterval(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        onInterimRef.current("...");
      } else {
        clearInterval(intervalId);
      }
    }, 1000);
  }, [isSupported]);

  return { isSupported, isListening, startListening, stopListening };
}
