"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "luka_chat_history";

// localStorage as immediate optimistic cache (zero-flicker while DB loads)
function saveLocalMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

function loadLocalMessages(): ChatMessage[] {
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

// ─── Hook: sugerencias contextuales ──────────────────────────────────────────

export function useCoachSuggestions(enabled = true) {
  return useQuery({
    queryKey: ["coach-suggestions"],
    queryFn: async () => {
      const res = await api.coach.getSuggestions();
      if (!res.success || !res.data) throw new Error("No se pudieron obtener sugerencias");
      return res.data.suggestions;
    },
    staleTime: 30 * 60_000, // 30 min
    enabled,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("403")) return false;
      return failureCount < 1;
    },
  });
}

// ─── Hook: chat en streaming ──────────────────────────────────────────────────

export function useCoachChat() {
  const queryClient = useQueryClient();

  // Optimistic init from localStorage — replaced by DB data once loaded
  const [messages, setMessages] = useState<ChatMessage[]>(loadLocalMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [latestAssistantIdx, setLatestAssistantIdx] = useState<number | null>(null);
  const [dbSyncError, setDbSyncError] = useState(false);

  // Fetch persisted history from DB; overrides localStorage on first load
  const { data: dbHistory, isSuccess: dbLoaded } = useQuery({
    queryKey: ["coach-history"],
    queryFn: async () => {
      const res = await api.coach.getHistory();
      if (!res.success || !res.data) return [] as ChatMessage[];
      return res.data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    },
    staleTime: Infinity, // managed manually
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("403")) return false;
      return failureCount < 1;
    },
  });

  // Si el servidor devuelve historial, es la fuente de verdad.
  // Si devuelve [] (usuario nuevo, sync pendiente o error silencioso), NO pisar lo que ya
  // hay en memoria / localStorage — evita perder el chat al entrar desde inicio.
  useEffect(() => {
    if (!dbLoaded) return;
    const history = dbHistory ?? [];
    if (history.length > 0) {
      setMessages(history);
      saveLocalMessages(history);
    }
  }, [dbLoaded, dbHistory]);

  const sendMessage = useCallback(
    async (userText: string) => {
      const newMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: userText },
      ];
      setMessages(newMessages);
      saveLocalMessages(newMessages);
      queryClient.setQueryData<ChatMessage[]>(["coach-history"], newMessages);
      setIsStreaming(true);
      setStreamingContent("");

      // Save user message to DB (fire-and-forget)
      api.coach.saveMessage({ role: "user", content: userText }).catch(() => {
        setDbSyncError(true);
      });

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
            if (payload === "[DONE]") {
              done = true;
              break;
            }

            try {
              const parsed = JSON.parse(payload) as { text?: string; error?: string };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                accumulated += parsed.text;
                setStreamingContent(accumulated);
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: accumulated || "...",
        };

        setMessages((prev) => {
          const updated = [...prev, assistantMsg];
          setLatestAssistantIdx(updated.length - 1);
          saveLocalMessages(updated);
          queryClient.setQueryData<ChatMessage[]>(["coach-history"], updated);
          return updated;
        });

        // Save assistant reply to DB (fire-and-forget)
        api.coach.saveMessage({ role: "assistant", content: assistantMsg.content }).catch(() => {
          setDbSyncError(true);
        });

        // Invalidate daily insight so it refreshes with updated context
        void queryClient.invalidateQueries({ queryKey: ["coach-insight"] });
      } catch {
        const errMsg: ChatMessage = {
          role: "assistant",
          content: "Uy parcero, se me fue la conexión un momento. ¿Lo intentamos de nuevo?",
        };
        setMessages((prev) => {
          const updated = [...prev, errMsg];
          saveLocalMessages(updated);
          queryClient.setQueryData<ChatMessage[]>(["coach-history"], updated);
          return updated;
        });
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [messages, queryClient],
  );

  const clearChat = useCallback(async () => {
    setMessages([]);
    setStreamingContent("");
    setIsStreaming(false);
    setLatestAssistantIdx(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    // Delete from DB
    try {
      await api.coach.clearHistory();
      queryClient.setQueryData(["coach-history"], []);
    } catch {
      setDbSyncError(true);
    }
  }, [queryClient]);

  return {
    messages,
    sendMessage,
    isStreaming,
    streamingContent,
    clearChat,
    latestAssistantIdx,
    dbSyncError,
  };
}
