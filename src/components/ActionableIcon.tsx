import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionableIconProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  badge?: number;
  pulse?: boolean;
}

export function ActionableIcon({
  icon: Icon,
  label,
  onClick,
  variant = 'ghost',
  size = 'icon',
  className,
  disabled = false,
  loading = false,
  badge,
  pulse = false
}: ActionableIconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant={variant}
              size={size}
              onClick={onClick}
              disabled={disabled || loading}
              className={cn(
                "transition-all duration-300 hover:scale-110 hover:shadow-lg",
                pulse && "animate-pulse",
                className
              )}
            >
              <Icon className={cn(
                "w-4 h-4",
                loading && "animate-spin"
              )} />
              <span className="sr-only">{label}</span>
            </Button>
            {badge !== undefined && badge > 0 && (
              <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                {badge > 99 ? '99+' : badge}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}