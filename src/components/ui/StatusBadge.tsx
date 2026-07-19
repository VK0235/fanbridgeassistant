import { getDensityBadgeClasses, getWaitBadgeClasses, getSeverityClasses } from "../../lib/utils";

type BadgeVariant = "density" | "wait" | "severity";

interface StatusBadgeProps {
  /** The status level string (e.g., "critical", "high", "medium", "low"). */
  level: string;
  /** Which badge style variant to use. */
  variant: BadgeVariant;
  /** Optional additional CSS classes. */
  className?: string;
}

const variantResolvers: Record<BadgeVariant, (level: string) => string> = {
  density: getDensityBadgeClasses,
  wait: getWaitBadgeClasses,
  severity: getSeverityClasses,
};

/**
 * A reusable badge component for density, wait-status, and severity indicators.
 * Consolidates 4 separate badge functions into one component.
 */
export default function StatusBadge({ level, variant, className = "" }: StatusBadgeProps) {
  const classes = variantResolvers[variant](level);

  return (
    <span className={`${classes} ${className}`.trim()}>
      {level}
    </span>
  );
}
