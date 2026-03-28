"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "luka_chat_history";

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

// ─── Hook: insight del día ────────────────────────────────────────────────────

export function useCoachInsight() {
  return useQuery({
    queryKey: ["coach-insight"],
    queryFn: async () => {
      const res = await api.coach.getInsight();
      if (!res.success || !res.data) throw new Error("No se pudo obtener el insight");
      return res.data.content;
    },
    staleTime: 60 * 60_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("403")) return false;
      return failureCount < 1;
    },
  });
}

// ─── Hook: chat en streaming ──────────────────────────────────────────────────

export function useCoachChat() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  // Índice del último mensaje del asistente recibido en esta sesión (para animarlo)
  const [latestAssistantIdx, setLatestAssistantIdx] = useState<number | null>(null);

  // Guardar en localStorage cada vez que cambia el historial
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const sendMessage = useCallback(async (userText: string) => {
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const reader = await api.coach.streamChat(newMessages);
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";
      let done = false;

      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          buffer += decoder.decode(result.value, { stream: true });
        }

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const payload = trimmed.slice(6);
          if (payload === "[DONE]") { done = true; break; }

          try {
            const parsed = JSON.parse(payload) as { text?: string; error?: string };
            if (parsed.error) {
              console.error("[coach] Error del servidor:", parsed.error);
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamingContent(accumulated);
            }
          } catch {
            // JSON inválido — ignorar línea
          }
        }
      }

      // Commitear la respuesta al historial y marcar su índice para animarla
      setMessages((prev) => {
        const updated = [...prev, { role: "assistant" as const, content: accumulated || "..." }];
        setLatestAssistantIdx(updated.length - 1);
        return updated;
      });
      // Invalidar el insight diario para que se recargue con contexto actualizado
      void queryClient.invalidateQueries({ queryKey: ["coach-insight"] });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Uy parcero, se me fue la conexión un momento. ¿Lo intentamos de nuevo?",
        },
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setStreamingContent("");
    setIsStreaming(false);
    setLatestAssistantIdx(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { messages, sendMessage, isStreaming, streamingContent, clearChat, latestAssistantIdx };
}
