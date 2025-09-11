import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: "default" | "success" | "warning" | "destructive";
  onClick?: () => void;
}

interface MobileStatsProps {
  stats: StatCardProps[];
  className?: string;
}

const variantClasses = {
  default: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
  success: "bg-gradient-to-br from-success/10 to-success/5 border-success/20",
  warning: "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20",
  destructive: "bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20",
};

const iconVariantClasses = {
  default: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

function StatCard({ title, value, subtitle, icon, trend, variant = "default", onClick }: StatCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 touch-manipulation",
        variantClasses[variant],
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{value}</span>
              {trend && (
                <Badge 
                  variant={trend.isPositive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {trend.value}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg", iconVariantClasses[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MobileStats({ stats, className }: MobileStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 p-4", className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}