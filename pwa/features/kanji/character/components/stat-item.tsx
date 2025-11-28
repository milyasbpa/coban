import { cn } from "@/pwa/core/lib/utils";

interface StatItemProps {
  label: string;
  value: string | number;
  variant?: "default" | "muted";
  className?: string;
}

export function StatItem({ label, value, variant = "default", className }: StatItemProps) {
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
      <span
        className={cn(
          "text-2xl font-bold",
          variant === "muted" && "text-muted-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
