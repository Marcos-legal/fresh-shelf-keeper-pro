
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
    valueDot: 'bg-primary',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    valueDot: 'bg-success',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    valueDot: 'bg-warning',
  },
  danger: {
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    valueDot: 'bg-destructive',
  },
};

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  variant, 
  description, 
  onClick,
  isActive,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-card rounded-xl border border-border/60 p-4 sm:p-5 transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        isActive && "ring-2 ring-primary border-primary/30 shadow-md"
      )}
    >
      {/* Header: label + icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center", styles.iconBg)}>
          <Icon className={cn("w-4 h-4 sm:w-[18px] sm:h-[18px]", styles.iconColor)} />
        </div>
      </div>

      {/* Value */}
      <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
        {value.toLocaleString()}
      </div>

      {/* Description */}
      {description && (
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{description}</p>
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );
}
