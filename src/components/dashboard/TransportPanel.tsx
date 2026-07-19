import type { ShuttleRoute, ParkingLot } from "../../types";
import ProgressBar from "../ui/ProgressBar";
import CircularGauge from "../ui/CircularGauge";
import { getEcoPercentages } from "../../lib/utils";

interface TransportPanelProps {
  shuttleRoutes: ShuttleRoute[];
  parkingLots: ParkingLot[];
  selectedVenue: string;
}

/**
 * Transport & sustainability panel: shuttle tracker, parking lots, and eco gauges.
 */
export default function TransportPanel({ shuttleRoutes, parkingLots, selectedVenue }: TransportPanelProps) {
  const eco = getEcoPercentages(selectedVenue);

  return (
    <div className="glass-card rounded-2xl p-5 space-y-5 hover:bg-white/80 transition-all duration-300">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
        <span className="w-1.5 h-2.5 bg-emerald-650 rounded-sm" />
        Transport & Carbon Offsets
      </h3>

      {/* Shuttle Tracker */}
      <div className="space-y-3">
        <h4 className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
          Transit Shuttles Load Factor
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shuttleRoutes.map((shuttle, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 shadow-[0_4px_12px_rgba(0,0,0,0.005)]">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xs font-bold text-slate-855">{shuttle.route}</h5>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5 truncate max-w-[120px]" title={shuttle.from}>
                    {shuttle.from}
                  </p>
                </div>
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${
                    shuttle.status.includes("delay")
                      ? "bg-red-50 text-red-655 border-red-100"
                      : "bg-emerald-50 text-emerald-650 border-emerald-100"
                  }`}
                >
                  {shuttle.status}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-1">
                  <span>Load Factor</span>
                  <span>{shuttle.capacity_pct}%</span>
                </div>
                <ProgressBar current={shuttle.capacity_pct} max={100} colorClass="bg-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parking & Sustainability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        {/* Parking Lot Occupancy */}
        <div className="space-y-2">
          <h4 className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
            Lot Occupancy
          </h4>
          <div className="space-y-1.5">
            {parkingLots.map((lot, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">{lot.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-805">
                    {lot.spaces}/{lot.total}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      lot.status === "full" ? "bg-red-550 animate-pulse" : "bg-emerald-550 animate-pulse"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Card */}
        <div className="bg-emerald-500/[0.01] border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase mb-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Eco parameters
            </div>
            <p className="text-[10px] text-slate-555 leading-snug font-semibold font-chat">
              {selectedVenue === "metlife"
                ? "MetLife stadium is running on 85% waste recycling."
                : selectedVenue === "sofi"
                ? "SoFi targets 90% water waste recycling diversion."
                : "Azteca utilizes 80% solar backup cells for lights."}
            </p>
          </div>

          <div className="flex gap-2.5 shrink-0">
            <CircularGauge percentage={eco.carbon} strokeColor="#10b981" label="Offset" />
            <CircularGauge percentage={eco.solar} strokeColor="#3b82f6" label="solar" />
          </div>
        </div>
      </div>
    </div>
  );
}
