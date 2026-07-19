"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { WELCOME_MESSAGES } from "../constants";
import type { Message, UserMode, ChatResponse } from "../types";

interface ChatHook {
  messages: Message[];
  chatInput: string;
  setChatInput: (value: string) => void;
  isLoading: boolean;
  detectedIntent: string;
  sendMessage: (e?: React.FormEvent) => Promise<void>;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Manages chat state: messages, input, API calls, welcome messages, and auto-scroll.
 *
 * @param selectedVenue - Current venue ID.
 * @param selectedLanguage - Current language selection.
 * @param userMode - Current user persona.
 */
export function useChat(
  selectedVenue: string,
  selectedLanguage: string,
  userMode: UserMode
): ChatHook {
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: "assistant", content: WELCOME_MESSAGES[userMode] },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [prevUserMode, setPrevUserMode] = useState<UserMode>(userMode);
  if (userMode !== prevUserMode) {
    setPrevUserMode(userMode);
    setMessages([{ role: "assistant", content: WELCOME_MESSAGES[userMode] }]);
  }

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const query = chatInput.trim();
      if (!query || isLoading) return;

      const userMsg: Message = { role: "user", content: query };
      setMessages((prev) => [...prev, userMsg]);
      setChatInput("");
      setIsLoading(true);
      setDetectedIntent("");

      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: query,
            language: selectedLanguage,
            history: historyPayload,
            venue_id: selectedVenue,
            user_mode: userMode,
          }),
        });

        const result: ChatResponse = await response.json();

        if (response.ok && !result.error) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: result.reply,
              intent: result.detected_intent,
              cached: result.cached,
            },
          ]);
          setDetectedIntent(result.detected_intent);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Error: ${result.error || "Failed to contact system server."}`,
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Assistant is temporarily unavailable. Please check your Groq API key.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatInput, isLoading, messages, selectedLanguage, selectedVenue, userMode]
  );

  return {
    messages,
    chatInput,
    setChatInput,
    isLoading,
    detectedIntent,
    sendMessage,
    chatContainerRef,
  };
}
