import {
  LayoutDashboard, Snowflake, Thermometer, Home, Refrigerator,
  Package, FileText, Printer, Eye, Calculator, Menu, ChevronRight, QrCode,
  MoreHorizontal,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const navSections = [
  { label: "Visão Geral", items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] },
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
      { title: "Leitor QR", url: "/leitor-qrcode", icon: QrCode },
      { title: "Relatórios", url: "/relatorios", icon: FileText },
    ],
  },
];

const bottomNav = [
  { title: "Início", url: "/", icon: LayoutDashboard },
  { title: "Produtos", url: "/cadastro", icon: Package },
  { title: "QR Code", url: "/leitor-qrcode", icon: QrCode },
  { title: "Etiquetas", url: "/impressao-etiquetas", icon: Printer },
];

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const { stats } = useProductsSupabase();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) setIsVisible(true);
      else if (currentScrollY > lastScrollY.current && currentScrollY > 60) setIsVisible(false);
      else if (currentScrollY < lastScrollY.current - 5) setIsVisible(true);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const isBottomActive = (url: string) => {
    if (url === '/') return location.pathname === '/';
    if (url === '/cadastro') return ['/cadastro', '/refrigerado', '/congelado', '/ambiente', '/camara-fria'].includes(location.pathname);
    return location.pathname === url;
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40 h-11 w-11 rounded-xl shadow-md bg-background/95 backdrop-blur-xl border-border/50 transition-all duration-300 sm:left-4",
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-14 opacity-0"
            )}
            aria-label="Abrir menu completo"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[88vw] max-w-[340px] p-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] flex flex-col border-r-border/60">
          <SheetHeader className="p-5 pb-4 border-b border-border/50 bg-background/95">
            <div className="flex items-center gap-3 text-left">
              <div className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <Package className="w-5 h-5 text-primary-foreground" />
                <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-base font-bold text-left">ValiControl</SheetTitle>
                <p className="text-[11px] text-muted-foreground">Controle de Validades</p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-3">
            {navSections.map((section) => (
              <div key={section.label} className="mb-2">
                <div className="px-5 py-2">
                  <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/55 font-bold">{section.label}</span>
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
                        "flex items-center justify-between mx-3 px-3.5 py-3 rounded-xl transition-all duration-150 group min-h-11",
                        active ? "bg-primary/10 text-primary font-semibold shadow-sm" : "text-foreground/70 hover:bg-accent hover:text-foreground active:bg-accent/80"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-[18px] h-[18px]", active ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {count > 0 && (
                          <span className={cn(
                            "text-[9px] font-bold min-w-5 h-5 px-1.5 rounded-full inline-flex items-center justify-center",
                            active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                          )}>{count > 999 ? '999+' : count}</span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/35 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border/50 space-y-3 bg-muted/20">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-success/8 border border-success/10 text-center">
                <div className="text-xl font-bold text-success leading-none">{stats.validos}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Válidos</div>
              </div>
              <div className="p-3 rounded-xl bg-destructive/8 border border-destructive/10 text-center">
                <div className="text-xl font-bold text-destructive leading-none">{stats.vencidos}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Vencidos</div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <UserMenu />
              <ThemeToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <nav
        aria-label="Navegação rápida"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_18px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {bottomNav.map((item) => {
            const active = isBottomActive(item.url);
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground active:bg-muted"
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span>{item.title}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-medium text-muted-foreground active:bg-muted"
            aria-label="Abrir mais opções"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
