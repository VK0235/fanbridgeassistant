import type { StaffAlert, MedicalPoint } from "../../types";
import { getSeverityClasses } from "../../lib/utils";

interface OperationsAlertsProps {
  staffAlerts: StaffAlert[];
  medicalPoints: MedicalPoint[];
}

/**
 * Operations warnings panel showing active staff alerts and medical assistance points.
 */
export default function OperationsAlerts({ staffAlerts, medicalPoints }: OperationsAlertsProps) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:bg-white/80 transition-all duration-300">
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-550 mb-4 flex items-center gap-1.5">
          <span className="w-1.5 h-2.5 bg-amber-500 rounded-sm" />
          Operations Warnings
        </h3>

        {/* Active alerts */}
        <div className="space-y-2 mb-4">
          {staffAlerts.length > 0 ? (
            staffAlerts.map((alert, i) => (
              <div
                key={i}
                className={`rounded-2xl p-3 flex items-start gap-3 border shadow-sm ${getSeverityClasses(alert.severity)}`}
              >
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      {alert.severity} ALERT
                    </span>
                    <span className="text-[9px] font-bold opacity-75">
                      {new Date(alert.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs mt-1 font-bold leading-normal font-chat">
                    [{alert.zone}] {alert.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-400 font-bold">
                All telemetry indicators normal. No active alerts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Medical Points */}
      <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 space-y-2">
        <h4 className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
          Medical Assistance Points
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {medicalPoints.map((med, i) => (
            <div key={i} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.005)]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <div>
                <p className="font-bold text-slate-800 truncate max-w-[140px]">{med.location}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">{med.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
