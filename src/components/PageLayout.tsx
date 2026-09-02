import { ReactNode } from "react";
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

export function PageLayout({ children, title, description, icon: Icon, iconClassName, headerActions }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <MobileDrawer />
      <AppSidebar />
      <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:pl-[var(--valicontrol-sidebar-width)] transition-[padding-left] duration-200 ease-out">
        <div className="mx-auto w-full max-w-[1520px] px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
          <header className="sticky top-0 z-20 -mx-3 mb-5 border-b border-border/70 bg-background/95 px-3 py-3 backdrop-blur-sm sm:-mx-6 sm:mb-7 sm:px-6 sm:py-4 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                {Icon && (
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-primary/10 sm:h-10 sm:w-10", iconClassName || "bg-primary/10")}>
                    <Icon className={cn("h-[18px] w-[18px] sm:h-5 sm:w-5", iconClassName ? "" : "text-primary")} />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-base font-bold tracking-tight text-foreground sm:text-xl lg:text-2xl">{title}</h1>
                  {description && <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block sm:text-sm">{description}</p>}
                </div>
              </div>
              {headerActions && <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{headerActions}</div>}
            </div>
          </header>
          <section className="relative">{children}</section>
        </div>
      </main>
    </div>
  );
}
