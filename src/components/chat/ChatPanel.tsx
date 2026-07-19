import { PERSONA_LABELS, QUICK_SUGGESTIONS, MAX_MESSAGE_LENGTH } from "../../constants";
import type { Message, UserMode } from "../../types";
import ChatMessage from "./ChatMessage";

interface ChatPanelProps {
  messages: Message[];
  chatInput: string;
  setChatInput: (value: string) => void;
  isLoading: boolean;
  detectedIntent: string;
  sendMessage: (e?: React.FormEvent) => Promise<void>;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  userMode: UserMode;
  selectedLanguage: string;
  isRecording: boolean;
  speechError: string;
  onToggleRecording: () => void;
  onSpeak: (text: string) => void;
  activeMobileTab: "dashboard" | "chat";
}

/**
 * The full AI assistant chat panel — header, messages, suggestions, and input form.
 */
export default function ChatPanel({
  messages,
  chatInput,
  setChatInput,
  isLoading,
  detectedIntent,
  sendMessage,
  chatContainerRef,
  userMode,
  selectedLanguage,
  isRecording,
  speechError,
  onToggleRecording,
  onSpeak,
  activeMobileTab,
}: ChatPanelProps) {
  const suggestions = QUICK_SUGGESTIONS[userMode];

  return (
    <div
      className={`w-full lg:w-[400px] lg:sticky lg:top-6 h-[600px] lg:h-[calc(100vh-7rem)] bg-white/70 backdrop-blur-lg border border-slate-205/65 shadow-[0_8px_32px_0_rgba(31,38,135,0.035)] rounded-2xl flex flex-col overflow-hidden shrink-0 z-10 ${
        activeMobileTab === "chat" ? "flex" : "hidden lg:flex"
      }`}
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-105 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-655 animate-pulse" />
            AI Assistant
          </h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
            {PERSONA_LABELS[userMode]} · {selectedLanguage}
          </p>
        </div>
        {detectedIntent && (
          <span className="text-[9px] uppercase tracking-wider font-extrabold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full shadow-sm">
            {detectedIntent}
          </span>
        )}
      </div>

      {/* Voice input error banner */}
      {speechError && (
        <div className="bg-red-50 text-red-755 text-[10px] px-4 py-2 border-b border-red-100 font-bold animate-pulse">
          {speechError}
        </div>
      )}

      {/* Chat Message Window */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none bg-[#fcfdfe]/40 font-chat"
      >
        {messages.map((m, i) => (
          <ChatMessage key={i} message={m} onSpeak={onSpeak} />
        ))}

        {isLoading && (
          <div className="flex flex-col items-start" role="status" aria-live="polite">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
            </div>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 px-1">
              Retrieving context...
            </span>
          </div>
        )}
      </div>

      {/* Quick suggestions */}
      <div className="px-4 py-2 bg-white/40 border-t border-slate-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
        {suggestions.map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => setChatInput(phrase)}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-550 px-2.5 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Chat Form Input */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm flex items-center gap-2 shrink-0"
      >
        {/* Voice Input Button */}
        <button
          type="button"
          onClick={onToggleRecording}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isRecording
              ? "bg-red-50 border-red-300 text-red-500 animate-pulse scale-95"
              : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 shadow-sm"
          }`}
          title="Toggle speech input (Web Speech API)"
          aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={isRecording ? "Listening..." : "Ask about navigation, wait times, safety..."}
          maxLength={MAX_MESSAGE_LENGTH}
          className="flex-1 bg-white border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-xs text-slate-805 font-bold outline-none transition-all placeholder-slate-400 font-chat"
          disabled={isLoading}
          aria-label="Chat message input"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!chatInput.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 text-white flex items-center justify-center shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 disabled:bg-slate-100 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all cursor-pointer shrink-0"
          aria-label="Send message"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  );
}
