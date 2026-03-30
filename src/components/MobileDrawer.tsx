import { 
  LayoutDashboard, Snowflake, Thermometer, Home, Refrigerator,
  Package, FileText, Printer, Eye, Calculator, Menu, ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const navSections = [
  {
    label: "Visão Geral",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Armazenamento",
    items: [
      { title: "Refrigerado", url: "/refrigerado", icon: Thermometer },
      { title: "Congelado", url: "/congelado", icon: Snowflake },
      { title: "Ambiente", url: "/ambiente", icon: Home },
      { title: "Câmara Fria", url: "/camara-fria", icon: Refrigerator },
    ],
  },
  {
    label: "Operações",
    items: [
      { title: "Cadastro", url: "/cadastro", icon: Package },
      { title: "Estoque", url: "/contagem-estoque", icon: Calculator },
      { title: "Etiquetas", url: "/impressao-etiquetas", icon: Printer },
      { title: "Visualizar", url: "/visualizar-etiquetas", icon: Eye },
      { title: "Relatórios", url: "/relatorios", icon: FileText },
    ],
  },
];

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { stats } = useProductsSupabase();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const isActive = (path: string) => location.pathname === path;

  const getCategoryCount = (url: string) => {
    if (url === '/') return stats.total;
    if (url === '/refrigerado') return stats.porCategoria['refrigerado'] || 0;
    if (url === '/congelado') return stats.porCategoria['congelado'] || 0;
    if (url === '/ambiente') return stats.porCategoria['ambiente'] || 0;
    if (url === '/camara-fria') return stats.porCategoria['camara-fria'] || 0;
    return 0;
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 -ml-1">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
                <SheetHeader className="p-5 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <SheetTitle className="text-base font-bold text-left">ValiControl</SheetTitle>
                      <p className="text-[11px] text-muted-foreground">Controle de Validades</p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-2">
                  {navSections.map((section) => (
                    <div key={section.label} className="mb-1">
                      <div className="px-5 py-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                          {section.label}
                        </span>
                      </div>
                      {section.items.map((item) => {
                        const active = isActive(item.url);
                        const count = getCategoryCount(item.url);
                        return (
                          <Link
                            key={item.title}
                            to={item.url}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center justify-between mx-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                              active
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-foreground/70 hover:bg-accent hover:text-foreground active:bg-accent/80"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className={cn("w-[18px] h-[18px]", active ? "text-primary" : "text-muted-foreground")} />
                              <span className="text-sm">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {count > 0 && (
                                <span className={cn(
                                  "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                                  active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                  {count}
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Footer stats */}
                <div className="p-4 border-t border-border/50 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-success/8 text-center">
                      <div className="text-lg font-bold text-success">{stats.validos}</div>
                      <div className="text-[10px] text-muted-foreground">Válidos</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-destructive/8 text-center">
                      <div className="text-lg font-bold text-destructive">{stats.vencidos}</div>
                      <div className="text-[10px] text-muted-foreground">Vencidos</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <UserMenu />
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">ValiControl</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </>
  );
}
