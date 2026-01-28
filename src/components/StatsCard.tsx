
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
  onClick?: () => void;
  actionIcon?: LucideIcon;
  actionLabel?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  variant, 
  description, 
  onClick,
  actionIcon: ActionIcon,
  actionLabel 
}: StatsCardProps) {
  const variants = {
    default: 'gradient-blue text-white',
    success: 'gradient-success text-white',
    warning: 'gradient-warning text-white',
    danger: 'gradient-danger text-white',
  };

  const bgClass = variants[variant];

  return (
    <Card className={cn(
      "overflow-hidden animate-fade-in transition-all duration-300 hover:shadow-xl group",
      onClick && "cursor-pointer hover:scale-105"
    )}>
      <CardHeader 
        className={`${bgClass} pb-2 sm:pb-3 p-3 sm:p-6 transition-all duration-300 group-hover:shadow-lg`}
        onClick={onClick}
      >
        <CardTitle className="flex items-center justify-between text-sm sm:text-lg font-semibold">
          <span className="truncate">{title}</span>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" />
            {onClick && (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/50 rounded-full animate-pulse" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-6 p-3 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1 transition-colors duration-300">
              {value.toLocaleString()}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{description}</p>
            )}
          </div>
          {ActionIcon && actionLabel && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hidden sm:flex"
            >
              <ActionIcon className="w-4 h-4 mr-1" />
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
