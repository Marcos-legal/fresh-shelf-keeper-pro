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
    <div className="min-h-screen min-h-[100dvh] flex w-full min-w-0 overflow-x-clip bg-background">
      <MobileDrawer />
      <AppSidebar />
      <main className="flex-1 min-w-0 w-full overflow-x-hidden lg:pl-[var(--valicontrol-sidebar-width)] transition-[padding-left] duration-200 ease-out">
        <div className="mx-auto w-full min-w-0 max-w-[1520px] px-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:py-7 lg:pb-7">
          <header className="relative z-20 -mx-3 mb-4 border-b border-border/70 bg-background px-3 py-3 sm:-mx-6 sm:mb-7 sm:px-6 sm:py-4 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex min-w-0 max-w-[1520px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-2.5 pl-12 sm:gap-3 lg:pl-0">
                {Icon && (
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-primary/10 sm:h-10 sm:w-10", iconClassName || "bg-primary/10")}>
                    <Icon className={cn("h-[18px] w-[18px] sm:h-5 sm:w-5", iconClassName ? "" : "text-primary")} />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="break-words text-base font-bold text-foreground sm:text-xl lg:text-2xl">{title}</h1>
                  {description && <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block sm:text-sm">{description}</p>}
                </div>
              </div>
              {headerActions && <div className="flex w-full min-w-0 flex-wrap items-center gap-2 [&>*]:min-w-0 [&>*]:max-w-full lg:w-auto lg:shrink-0">{headerActions}</div>}
            </div>
          </header>
          <section className="relative">{children}</section>
        </div>
      </main>
    </div>
  );
}
