
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
        className={`${bgClass} pb-3 transition-all duration-300 group-hover:shadow-lg`}
        onClick={onClick}
      >
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <span>{title}</span>
          <div className="flex items-center space-x-2">
            <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            {onClick && (
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl font-bold text-foreground mb-1 transition-colors duration-300">
              {value.toLocaleString()}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
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
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent"
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
