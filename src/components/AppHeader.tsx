import type { VenueSummary, UserMode } from "../types";

interface AppHeaderProps {
  venues: VenueSummary[];
  selectedVenue: string;
  onVenueChange: (venueId: string) => void;
  userMode: UserMode;
  onUserModeChange: (mode: string) => void;
  languages: string[];
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

/**
 * Application header bar with logo, venue selector, persona selector, and language selector.
 */
export default function AppHeader({
  venues,
  selectedVenue,
  onVenueChange,
  userMode,
  onUserModeChange,
  languages,
  selectedLanguage,
  onLanguageChange,
}: AppHeaderProps) {
  return (
    <header className="min-h-16 py-3 shrink-0 border border-white/50 bg-white/60 backdrop-blur-md px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between mx-4 sm:mx-6 mt-4 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.015)] z-10 gap-3">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
            FanBridge AI
          </h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Stadium Operations Companion
          </p>
        </div>
      </div>

      {/* Configuration Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
        {/* Venue Selector */}
        <SelectorGroup label="Stadium">
          <select
            value={selectedVenue}
            onChange={(e) => onVenueChange(e.target.value)}
            className="bg-transparent text-[10px] sm:text-xs text-slate-700 outline-none pr-2 py-0.5 font-bold cursor-pointer"
            aria-label="Select stadium"
          >
            {venues.length > 0 ? (
              venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))
            ) : (
              <option value="metlife">MetLife Stadium</option>
            )}
          </select>
        </SelectorGroup>

        {/* User Persona Selector */}
        <SelectorGroup label="View As">
          <select
            value={userMode}
            onChange={(e) => onUserModeChange(e.target.value)}
            className="bg-transparent text-[10px] sm:text-xs text-slate-700 outline-none pr-2 py-0.5 font-bold cursor-pointer"
            aria-label="Select user role"
          >
            <option value="fan">Fan</option>
            <option value="volunteer">Volunteer</option>
            <option value="staff">Staff</option>
            <option value="organizer">Organizer</option>
          </select>
        </SelectorGroup>

        {/* Language Selector */}
        <SelectorGroup label="Lang">
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-transparent text-[10px] sm:text-xs text-slate-700 outline-none pr-2 py-0.5 font-bold cursor-pointer"
            aria-label="Select language"
          >
            {languages.length > 0 ? (
              languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))
            ) : (
              <option value="English">English</option>
            )}
          </select>
        </SelectorGroup>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Internal sub-component for selector wrappers (DRY)
// ---------------------------------------------------------------------------

function SelectorGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center bg-white/40 border border-white/60 rounded-xl p-1 shadow-sm backdrop-blur-sm shrink-0">
      <span className="text-[8px] text-slate-450 px-1 font-extrabold uppercase">{label}</span>
      {children}
    </div>
  );
}
