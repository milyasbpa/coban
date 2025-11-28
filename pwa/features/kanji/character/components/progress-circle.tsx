import { cn } from "@/pwa/core/lib/utils";

interface ProgressCircleProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ProgressCircle({
  percentage,
  size = "lg",
  showLabel = true,
  className,
}: ProgressCircleProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  // Circle SVG parameters
  const radius = size === "sm" ? 28 : size === "md" ? 42 : 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-blue-500 dark:text-blue-400 transition-all duration-500"
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold text-blue-500 dark:text-blue-400", textSizeClasses[size])}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
