"use client";

import { useState, useEffect, useCallback } from "react";
import { LANGUAGE_LOCALE_MAP, SPEECH_ERROR_TIMEOUT_MS } from "../constants";

interface SpeechRecognitionHook {
  isRecording: boolean;
  speechError: string;
  toggleRecording: (language: string) => void;
}

/**
 * Custom hook encapsulating Web Speech Recognition (STT).
 *
 * @param onResult - Callback invoked with the transcript when recognition succeeds.
 */
export function useSpeechRecognition(onResult: (transcript: string) => void): SpeechRecognitionHook {
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SpeechRecognition is not in standard TS lib
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vendor-prefixed constructor
    const recog = new (SpeechRecognitionCtor as any)();
    recog.continuous = false;
    recog.interimResults = false;

    recog.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
      const resultText = event.results[0][0].transcript;
      onResult(resultText);
      setIsRecording(false);
    };

    recog.onerror = (event: { error: string }) => {
      console.error("Speech recognition error:", event.error);
      setSpeechError(`Voice input error: ${event.error}`);
      setIsRecording(false);
      setTimeout(() => setSpeechError(""), SPEECH_ERROR_TIMEOUT_MS);
    };

    recog.onend = () => {
      setIsRecording(false);
    };

    setRecognition(recog);
    // onResult is intentionally excluded — the caller should memoize it or accept stale closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRecording = useCallback(
    (language: string) => {
      if (!recognition) {
        setSpeechError("Speech recognition is not supported in this browser.");
        setTimeout(() => setSpeechError(""), SPEECH_ERROR_TIMEOUT_MS);
        return;
      }

      if (isRecording) {
        recognition.stop();
      } else {
        setSpeechError("");
        setIsRecording(true);
        recognition.lang = LANGUAGE_LOCALE_MAP[language] || "en-US";
        recognition.start();
      }
    },
    [recognition, isRecording]
  );

  return { isRecording, speechError, toggleRecording };
}
