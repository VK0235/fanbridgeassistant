interface ProgressBarProps {
  /** Current value. */
  current: number;
  /** Maximum value (used to calculate width percentage). */
  max: number;
  /** Tailwind background color class for the filled portion. */
  colorClass: string;
}

/**
 * A reusable horizontal progress bar.
 * Used for gate wait times and shuttle capacity indicators.
 */
export default function ProgressBar({ current, max, colorClass }: ProgressBarProps) {
  const widthPct = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${widthPct}%` }}
      />
    </div>
  );
}
