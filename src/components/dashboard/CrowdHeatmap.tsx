import type { CrowdZone } from "../../types";
import StatusBadge from "../ui/StatusBadge";
import { findZoneByBlueprintName, getZoneFillColor, getZoneStrokeColor } from "../../lib/utils";

interface CrowdHeatmapProps {
  crowdZones: CrowdZone[];
  onZoneClick: (query: string) => void;
}

/** Blueprint zone definitions for the SVG concourse map. */
const BLUEPRINT_ZONES = [
  { name: "North", path: "M26,18 C35,9 65,9 74,18 L68,23 C62,17 38,17 32,23 Z", query: "North Concourse" },
  { name: "South", path: "M26,42 C35,51 65,51 74,42 L68,37 C62,43 38,43 32,37 Z", query: "South Plaza" },
  { name: "West", path: "M18,22 C10,28 10,32 18,38 L23,34 C19,31 19,29 23,26 Z", query: "West Plaza" },
  { name: "East", path: "M82,22 C90,28 90,32 82,38 L77,34 C81,31 81,29 77,26 Z", query: "East Concourse" },
  { name: "Level 2", path: "M29,24 C34,18 66,18 71,24 L73,27 C69,22 31,22 27,27 Z", query: "Level 2 Concourse" },
  { name: "Upper Bowl", path: "M29,36 C34,42 66,42 71,36 L73,33 C69,38 31,38 27,33 Z", query: "Upper Bowl Ramp" },
] as const;

/**
 * Interactive SVG crowd density heatmap with concourse zone cards and legend.
 */
export default function CrowdHeatmap({ crowdZones, onZoneClick }: CrowdHeatmapProps) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col hover:bg-white/80 transition-all duration-300">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
        <span className="w-1 h-2.5 bg-blue-600 rounded-sm" />
        Interactive Bowl Heatmap
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50/50 rounded-2xl border border-slate-200/30 p-4">
        {/* SVG Blueprint */}
        <div className="w-full md:w-1/2 aspect-[16/11] flex items-center justify-center relative bg-white border border-slate-100 rounded-xl shadow-inner p-2 shrink-0">
          <svg viewBox="0 0 100 60" className="w-full h-full" role="img" aria-label="Stadium concourse heatmap">
            {/* Soccer Pitch */}
            <rect x="36" y="21" width="28" height="18" rx="2" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1" />
            <line x1="50" y1="21" x2="50" y2="39" stroke="#a7f3d0" strokeWidth="0.8" />
            <circle cx="50" cy="30" r="4.5" fill="none" stroke="#a7f3d0" strokeWidth="0.8" />

            {/* Dynamic Zone Segments */}
            {BLUEPRINT_ZONES.map((zone) => {
              const matchedZone = findZoneByBlueprintName(zone.name, crowdZones);
              return (
                <path
                  key={zone.name}
                  d={zone.path}
                  fill={getZoneFillColor(matchedZone?.density)}
                  stroke={getZoneStrokeColor(matchedZone?.density)}
                  strokeWidth="1.2"
                  className="cursor-pointer transition-all duration-200 hover:opacity-75"
                  onClick={() => onZoneClick(`Tell me about crowd conditions at ${zone.query}`)}
                  aria-label={`${zone.name} zone: ${matchedZone?.density ?? "unknown"} density`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onZoneClick(`Tell me about crowd conditions at ${zone.query}`);
                    }
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Zone Info Cards */}
        <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {crowdZones.map((zone, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 p-2.5 rounded-xl flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.005)] hover:border-slate-300 transition-all cursor-pointer gap-2"
              onClick={() => onZoneClick(`Tell me about crowd conditions at ${zone.zone}`)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-850 truncate" title={zone.zone}>
                  {zone.zone}
                </p>
                <span className="text-[8px] text-slate-404 font-bold uppercase">
                  {zone.density_pct}% density
                </span>
              </div>
              <StatusBadge level={zone.density} variant="density" className="shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 text-[9px] text-slate-450 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between border-t border-slate-100 pt-3 font-extrabold uppercase">
        <div className="flex items-center gap-3">
          <LegendDot color="bg-emerald-500" label="Low" />
          <LegendDot color="bg-yellow-500" label="Medium" />
          <LegendDot color="bg-orange-505" label="High" />
          <LegendDot color="bg-red-505" label="Critical" pulse />
        </div>
        <span className="italic font-bold normal-case text-slate-400">Click blueprint to ask AI</span>
      </div>
    </div>
  );
}

function LegendDot({ color, label, pulse }: { color: string; label: string; pulse?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${color} ${pulse ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
}
