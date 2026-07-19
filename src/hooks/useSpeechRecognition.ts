"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LANGUAGE_LOCALE_MAP, SPEECH_ERROR_TIMEOUT_MS } from "../constants";

interface SpeechRecognitionHook {
  isRecording: boolean;
  speechError: string;
  toggleRecording: (language: string) => void;
}

interface SpeechRecognitionResultEvent {
  results: {
    0: {
      0: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionResultEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

/**
 * Custom hook encapsulating Web Speech Recognition (STT).
 *
 * @param onResult - Callback invoked with the transcript when recognition succeeds.
 */
export function useSpeechRecognition(onResult: (transcript: string) => void): SpeechRecognitionHook {
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor =
      ((window as unknown as Record<string, unknown>).SpeechRecognition ??
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as SpeechRecognitionConstructor | undefined;

    if (!SpeechRecognitionCtor) return;

    const recog = new SpeechRecognitionCtor();
    recog.continuous = false;
    recog.interimResults = false;

    recog.onresult = (event: SpeechRecognitionResultEvent) => {
      const resultText = event.results[0][0].transcript;
      onResult(resultText);
      setIsRecording(false);
    };

    recog.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setSpeechError(`Voice input error: ${event.error}`);
      setIsRecording(false);
      setTimeout(() => setSpeechError(""), SPEECH_ERROR_TIMEOUT_MS);
    };

    recog.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recog;
  }, [onResult]);

  const toggleRecording = useCallback(
    (language: string) => {
      const recognition = recognitionRef.current;
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
    [isRecording]
  );

  return { isRecording, speechError, toggleRecording };
}
