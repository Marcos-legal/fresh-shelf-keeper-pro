import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileCardProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }>;
  actions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline";
  }>;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function MobileCard({
  title,
  subtitle,
  status,
  badges = [],
  actions = [],
  onClick,
  className,
  children
}: MobileCardProps) {
  const hasMainAction = onClick;
  const hasMenuActions = actions.length > 0;

  return (
    <Card 
      className={cn(
        "touch-manipulation transition-all duration-200",
        hasMainAction && "cursor-pointer hover:shadow-md active:scale-[0.98]",
        className
      )}
      onClick={hasMainAction && !hasMenuActions ? onClick : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base leading-tight truncate">
                {title}
              </h3>
              {status && (
                <Badge variant={status.variant} className="shrink-0 text-xs">
                  {status.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {badges.map((badge, index) => (
                  <Badge 
                    key={index} 
                    variant={badge.variant || "outline"} 
                    className="text-xs"
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {hasMenuActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 touch-manipulation"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {actions.map((action, index) => (
                    <DropdownMenuItem 
                      key={index}
                      onClick={action.onClick}
                      className={cn(
                        "flex items-center gap-2 touch-manipulation",
                        action.variant === "destructive" && "text-destructive focus:text-destructive"
                      )}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {hasMainAction && !hasMenuActions && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}