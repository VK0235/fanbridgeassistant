import type { MobileTab } from "../types";

interface MobileTabSwitcherProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

/**
 * Dashboard/Chat tab toggle visible only on mobile screens (below lg breakpoint).
 */
export default function MobileTabSwitcher({ activeTab, onTabChange }: MobileTabSwitcherProps) {
  return (
    <div className="flex lg:hidden shrink-0 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl p-1 mx-4 sm:mx-6 mt-3 shadow-sm select-none z-10">
      <TabButton
        label="Live Metrics"
        isActive={activeTab === "dashboard"}
        onClick={() => onTabChange("dashboard")}
      />
      <TabButton
        label="AI Assistant"
        isActive={activeTab === "chat"}
        onClick={() => onTabChange("chat")}
      />
    </div>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
        isActive
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
          : "text-slate-500 hover:text-slate-750"
      }`}
    >
      {label}
    </button>
  );
}
