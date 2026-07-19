import type { DashboardResponse } from "../../types";

interface StadiumSummaryBannerProps {
  dashboard: DashboardResponse;
  selectedVenue: string;
}

/**
 * Live stadium summary banner showing venue image, name, and key stat boxes.
 */
export default function StadiumSummaryBanner({ dashboard, selectedVenue }: StadiumSummaryBannerProps) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-white/80 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Stadium graphic */}
        <img
          src={`/images/${selectedVenue}.png`}
          alt={dashboard.venue_name}
          className="w-16 h-12 sm:w-28 sm:h-20 rounded-xl object-cover shadow-sm border border-white/60 shrink-0 hover:scale-[1.02] transition-all duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
              Live Telemetry Feed
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {dashboard.venue_name}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Stadium: {dashboard.city} · {dashboard.capacity.toLocaleString()} Seats
          </p>
        </div>
      </div>

      {/* Stat boxes */}
      <div className="flex items-center gap-4 self-stretch md:self-auto overflow-x-auto">
        <StatBox label="Fans Inside" value={dashboard.total_fans_today.toLocaleString()} colorClass="text-blue-650" />
        <StatBox label="Satisfaction" value={`Rating: ${dashboard.avg_satisfaction_score}`} colorClass="text-indigo-655" />
        <StatBox
          label="Alerts Log"
          value={`Alerts: ${dashboard.staff_alerts.length}`}
          colorClass={dashboard.staff_alerts.length > 0 ? "text-amber-605" : "text-emerald-600"}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal sub-component
// ---------------------------------------------------------------------------

function StatBox({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-3 min-w-[110px] sm:min-w-[125px] flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.005)]">
      <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">{label}</span>
      <span className={`text-base font-black mt-0.5 ${colorClass}`}>{value}</span>
    </div>
  );
}
