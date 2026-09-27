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
  default: { iconBg: 'bg-primary/10', iconColor: 'text-primary', activeBorder: 'border-primary/40 ring-primary/15', accent: 'bg-primary' },
  success: { iconBg: 'bg-success/10', iconColor: 'text-success', activeBorder: 'border-success/40 ring-success/15', accent: 'bg-success' },
  warning: { iconBg: 'bg-warning/10', iconColor: 'text-warning', activeBorder: 'border-warning/40 ring-warning/15', accent: 'bg-warning' },
  danger: { iconBg: 'bg-destructive/10', iconColor: 'text-destructive', activeBorder: 'border-destructive/40 ring-destructive/15', accent: 'bg-destructive' },
};

export function StatsCard({ title, value, icon: Icon, variant, description, onClick, isActive }: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full min-h-[116px] overflow-hidden bg-card text-left rounded-xl border p-4 sm:p-5",
        "transition-[box-shadow,border-color,transform] duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        onClick && "cursor-pointer active:scale-[0.985]",
        isActive ? cn("ring-2 border-transparent shadow-md", styles.activeBorder) : "border-border/70 hover:border-primary/20"
      )}
      aria-pressed={isActive}
    >
      <div className={cn("absolute inset-x-0 top-0 h-0.5", styles.accent)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.1em]">{title}</span>
          <div className="mt-2 text-2xl sm:text-[30px] font-bold text-foreground tracking-tight tabular-nums leading-none">{value.toLocaleString('pt-BR')}</div>
          {description && <p className="mt-3 text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed truncate">{description}</p>}
        </div>
        <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105", styles.iconBg)}>
          <Icon className={cn("w-[19px] h-[19px] sm:w-5 sm:h-5", styles.iconColor)} />
        </div>
      </div>
      {isActive && <div className={cn("absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full", styles.accent)} />}
    </button>
  );
}
