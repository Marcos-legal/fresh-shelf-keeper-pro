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
          <div className="px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8 max-w-[1440px] mx-auto w-full">
            <header className="sticky top-0 z-20 -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8 py-3 sm:py-4 mb-5 sm:mb-7 bg-background/90 backdrop-blur-xl border-b border-border/40">
              <div className="flex items-center justify-between gap-3 max-w-[1440px] mx-auto">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <SidebarTrigger className="hidden lg:flex h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-lg" />
                  {Icon && (
                    <div className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                      iconClassName || "bg-primary/10"
                    )}>
                      <Icon className={cn("w-[18px] h-[18px] sm:w-5 sm:h-5", iconClassName ? "" : "text-primary")} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight truncate">
                      {title}
                    </h1>
                    {description && (
                      <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {headerActions && (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {headerActions}
                  </div>
                )}
              </div>
            </header>

            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
