import type { Gate } from "../../types";
import StatusBadge from "../ui/StatusBadge";
import ProgressBar from "../ui/ProgressBar";
import { getWaitProgressColor } from "../../lib/utils";
import { MAX_WAIT_MINUTES_SCALE } from "../../constants";

interface GateBoardProps {
  gates: Gate[];
  onGateClick: (query: string) => void;
}

/**
 * Gate clearance board showing wait times, accessibility badges, and progress bars.
 */
export default function GateBoard({ gates, onGateClick }: GateBoardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col hover:bg-white/80 transition-all duration-300">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
        <span className="w-1 h-2.5 bg-indigo-650 rounded-sm" />
        Gate clearance Board
      </h3>

      <div className="space-y-2">
        {gates.map((gate, i) => (
          <div
            key={i}
            className="bg-white border border-slate-100 hover:border-slate-350/50 rounded-2xl p-3 flex items-center justify-between transition-all duration-300 hover:shadow-sm hover:scale-[1.005] cursor-pointer"
            onClick={() => onGateClick(`How is accessibility and wait times at ${gate.id}?`)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-205 flex flex-col items-center justify-center shrink-0 shadow-sm">
                <span className="text-[7px] text-slate-404 font-black uppercase leading-none">
                  {gate.zone}
                </span>
                <span className="text-xs font-black text-slate-800 mt-0.5">
                  {gate.id.replace("Gate ", "").replace("Puerta ", "")}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800">{gate.id}</h4>
                  {gate.accessible && (
                    <span className="text-[8px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-1.5 py-0.2 font-black uppercase tracking-wider">
                      access
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {gate.type}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs font-black text-slate-855">
                  {gate.wait_minutes} min
                </span>
                <StatusBadge level={gate.wait_status} variant="wait" />
              </div>
              <div className="w-20 mt-1.5 ml-auto">
                <ProgressBar
                  current={gate.wait_minutes}
                  max={MAX_WAIT_MINUTES_SCALE}
                  colorClass={getWaitProgressColor(gate.wait_status)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
