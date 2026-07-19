"use client";

import { LANGUAGE_LOCALE_MAP } from "../constants";

/**
 * Provides text-to-speech functionality using the Web Speech API.
 * Returns a function that speaks the given text in the selected language.
 */
export function useSpeechSynthesis() {
  const speakMessage = (text: string, language: string): void => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_LOCALE_MAP[language] || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return { speakMessage };
}
