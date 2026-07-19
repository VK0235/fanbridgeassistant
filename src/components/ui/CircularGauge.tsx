import {
  SVG_GAUGE_RADIUS,
  SVG_GAUGE_CENTER,
} from "../../constants";
import { calculateGaugeOffset, getGaugeCircumference } from "../../lib/utils";

interface CircularGaugeProps {
  /** Percentage value (0–100) to display. */
  percentage: number;
  /** Stroke color for the active arc. */
  strokeColor: string;
  /** Label displayed below the gauge. */
  label: string;
}

/**
 * A reusable SVG circular progress gauge.
 * Used for carbon-offset and solar-energy indicators.
 */
export default function CircularGauge({ percentage, strokeColor, label }: CircularGaugeProps) {
  const circumference = getGaugeCircumference(SVG_GAUGE_RADIUS);
  const offset = calculateGaugeOffset(percentage, SVG_GAUGE_RADIUS);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-11 h-11 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" aria-label={`${label}: ${percentage}%`}>
          <circle
            cx={SVG_GAUGE_CENTER}
            cy={SVG_GAUGE_CENTER}
            r={SVG_GAUGE_RADIUS}
            stroke="#f1f5f9"
            strokeWidth="2.5"
            fill="transparent"
          />
          <circle
            cx={SVG_GAUGE_CENTER}
            cy={SVG_GAUGE_CENTER}
            r={SVG_GAUGE_RADIUS}
            stroke={strokeColor}
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[8px] font-black text-slate-800">
          {percentage}%
        </span>
      </div>
      <span className="text-[7px] text-slate-404 font-extrabold uppercase mt-1">
        {label}
      </span>
    </div>
  );
}
