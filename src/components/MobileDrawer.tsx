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
  Activity,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
  { title: "Cadastro de Produtos", url: "/cadastro", icon: Package },
  { title: "Contagem de Estoque", url: "/contagem-estoque", icon: Calculator },
  { title: "Impressão de Etiquetas", url: "/impressao-etiquetas", icon: Printer },
  { title: "Visualizar Etiquetas", url: "/visualizar-etiquetas", icon: Eye },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
];

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { stats } = useProductsSupabase();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const getCategoryCount = (category: string) => {
    return stats.porCategoria[category] || 0;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed top-3 left-3 z-40 lg:hidden bg-background/90 backdrop-blur-sm shadow-lg border h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b bg-sidebar text-sidebar-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-blue rounded-lg flex items-center justify-center shadow-lg">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-lg font-bold">
                  Sistema de Validade
                </DrawerTitle>
                <p className="text-xs text-sidebar-foreground/70 flex items-center space-x-1 mt-1">
                  <Activity className="w-3 h-3" />
                  <span>Controle Inteligente</span>
                </p>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          
          {/* Status Bar Mobile */}
          <div className="mt-3 p-2 bg-sidebar-accent/50 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sidebar-foreground/70">Status do Sistema</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-success font-medium">Online</span>
              </div>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* Navigation Menu */}
          <div className="space-y-2 mb-6">
            {menuItems.map((item) => {
              const isCurrentPage = isActive(item.url);
              let badgeCount = 0;
              
              // Adicionar contadores para categorias específicas
              if (item.url === '/refrigerado') badgeCount = getCategoryCount('refrigerado');
              else if (item.url === '/congelado') badgeCount = getCategoryCount('congelado');
              else if (item.url === '/ambiente') badgeCount = getCategoryCount('ambiente');
              else if (item.url === '/camara-fria') badgeCount = getCategoryCount('camara-fria');
              else if (item.url === '/') badgeCount = stats.total;
              
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-all duration-300",
                    isCurrentPage 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-card hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={cn(
                      "w-5 h-5 transition-all duration-300",
                      isCurrentPage && "scale-110"
                    )} />
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  
                  {badgeCount > 0 && (
                    <Badge 
                      variant={isCurrentPage ? "secondary" : "default"} 
                      className="text-xs"
                    >
                      {badgeCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Stats Cards Mobile */}
          <div className="space-y-3 mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Estatísticas Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-success/10 rounded-lg text-center border border-success/20">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <div className="text-lg font-bold text-success">{stats.validos}</div>
                </div>
                <div className="text-xs text-muted-foreground">Válidos</div>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg text-center border border-destructive/20">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <div className="text-lg font-bold text-destructive">{stats.vencidos}</div>
                </div>
                <div className="text-xs text-muted-foreground">Vencidos</div>
              </div>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Usuário</span>
              <UserMenu />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 bg-muted/30">
          <div className="text-center text-xs text-muted-foreground">
            <p>© 2024 Sistema de Validade</p>
            <p className="font-medium">Versão 2.0 - Mobile</p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}