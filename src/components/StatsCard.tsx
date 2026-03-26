import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    activeBorder: 'border-primary/30 ring-primary/20',
    activeGlow: 'shadow-primary/5',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    activeBorder: 'border-success/30 ring-success/20',
    activeGlow: 'shadow-success/5',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    activeBorder: 'border-warning/30 ring-warning/20',
    activeGlow: 'shadow-warning/5',
  },
  danger: {
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    activeBorder: 'border-destructive/30 ring-destructive/20',
    activeGlow: 'shadow-destructive/5',
  },
};

export function StatsCard({ 
  title, value, icon: Icon, variant, description, onClick, isActive,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-card rounded-xl border p-4 sm:p-5 transition-all duration-200",
        onClick && "cursor-pointer active:scale-[0.98]",
        isActive 
          ? cn("ring-2 shadow-lg border-transparent", styles.activeBorder, styles.activeGlow)
          : "border-border/60 hover:shadow-md hover:-translate-y-0.5 hover:border-border"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", styles.iconBg)}>
          <Icon className={cn("w-4 h-4 sm:w-[18px] sm:h-[18px]", styles.iconColor)} />
        </div>
      </div>

      <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight tabular-nums">
        {value.toLocaleString()}
      </div>

      {description && (
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
      )}

      {isActive && (
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );
}
