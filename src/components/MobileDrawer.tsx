import { 
  LayoutDashboard, 
  Snowflake, 
  Thermometer, 
  Home, 
  Refrigerator,
  Package,
  FileText,
  Printer,
  Eye,
  Calculator,
  X,
  Menu,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { UserMenu } from "./UserMenu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Refrigerado", url: "/refrigerado", icon: Thermometer },
  { title: "Congelado", url: "/congelado", icon: Snowflake },
  { title: "Ambiente", url: "/ambiente", icon: Home },
  { title: "Câmara Fria", url: "/camara-fria", icon: Refrigerator },
  { title: "Cadastro", url: "/cadastro", icon: Package },
  { title: "Estoque", url: "/contagem-estoque", icon: Calculator },
  { title: "Etiquetas", url: "/impressao-etiquetas", icon: Printer },
  { title: "Visualizar", url: "/visualizar-etiquetas", icon: Eye },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
];

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { stats } = useProductsSupabase();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="fixed top-3 left-3 z-40 lg:hidden bg-card/95 backdrop-blur-sm shadow-sm border-border/60 h-10 w-10"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <DrawerTitle className="text-base font-bold">ValiControl</DrawerTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">Controle de Validades</p>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1 mb-6">
            {menuItems.map((item) => {
              const isCurrentPage = isActive(item.url);
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-sm",
                    isCurrentPage 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-foreground/70 hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isCurrentPage && "text-primary")} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-success/8 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                <span className="text-lg font-bold text-success">{stats.validos}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Válidos</div>
            </div>
            <div className="p-3 rounded-lg bg-destructive/8 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-lg font-bold text-destructive">{stats.vencidos}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Vencidos</div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Conta</span>
              <UserMenu />
            </div>
          </div>
        </div>
        
        <div className="border-t p-4">
          <div className="text-center text-[10px] text-muted-foreground">
            © 2024 ValiControl v2.0
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
