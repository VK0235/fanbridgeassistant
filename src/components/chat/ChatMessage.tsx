import type { Message } from "../../types";

interface ChatMessageProps {
  message: Message;
  onSpeak: (text: string) => void;
}

/**
 * Renders a single chat message bubble with metadata and a TTS "Listen" button.
 */
export default function ChatMessage({ message, onSpeak }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.005)] ${
          isUser
            ? "bg-gradient-to-tr from-blue-600 to-indigo-650 text-white rounded-tr-none"
            : "bg-white border border-slate-150 text-slate-800 rounded-tl-none"
        }`}
      >
        <p className="whitespace-pre-line">{message.content}</p>
      </div>

      {/* Meta details below message */}
      <div className="flex items-center gap-2 mt-1.5 px-1 text-[9px] text-slate-400 font-extrabold">
        <span>{isUser ? "You" : "Assistant"}</span>

        {message.intent && message.intent !== "general" && (
          <span>· Intent: {message.intent}</span>
        )}

        {message.cached && (
          <span className="text-emerald-700 border border-emerald-200/50 bg-emerald-50 px-1.5 rounded-full font-bold">
            cached
          </span>
        )}

        {!isUser && typeof window !== "undefined" && window.speechSynthesis && (
          <button
            onClick={() => onSpeak(message.content)}
            className="text-blue-600 hover:text-blue-850 ml-1 cursor-pointer font-extrabold uppercase tracking-wider flex items-center gap-0.5"
            title="Speak response"
            aria-label="Listen to this response"
          >
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
            </svg>
            Listen
          </button>
        )}
      </div>
    </div>
  );
}
