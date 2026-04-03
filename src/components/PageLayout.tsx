import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  headerActions?: ReactNode;
}

export function PageLayout({ 
  children, 
  title, 
  description, 
  icon: Icon, 
  iconClassName,
  headerActions 
}: PageLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MobileDrawer />
        <AppSidebar />
        <main className="flex-1 w-full min-w-0 overflow-x-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1400px] mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 min-w-0">
                <SidebarTrigger className="hidden lg:flex text-muted-foreground hover:text-foreground transition-colors" />
                {Icon && (
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    iconClassName || "bg-primary/10"
                  )}>
                    <Icon className={cn("w-5 h-5", iconClassName ? "" : "text-primary")} />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight truncate">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              {headerActions && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {headerActions}
                </div>
              )}
            </div>

            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
