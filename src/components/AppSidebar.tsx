
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
  Activity,
  Zap
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ActionableIcon } from "./ActionableIcon";
import { useProducts } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Refrigerado",
    url: "/refrigerado",
    icon: Thermometer,
  },
  {
    title: "Congelado",
    url: "/congelado",
    icon: Snowflake,
  },
  {
    title: "Ambiente",
    url: "/ambiente",
    icon: Home,
  },
  {
    title: "Câmara Fria",
    url: "/camara-fria",
    icon: Refrigerator,
  },
  {
    title: "Cadastro de Produtos",
    url: "/cadastro",
    icon: Package,
  },
  {
    title: "Contagem de Estoque",
    url: "/contagem-estoque",
    icon: Calculator,
  },
  {
    title: "Impressão de Etiquetas",
    url: "/impressao-etiquetas",
    icon: Printer,
  },
  {
    title: "Visualizar Etiquetas",
    url: "/visualizar-etiquetas",
    icon: Eye,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: FileText,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { stats } = useProducts();
  
  const getCategoryCount = (category: string) => {
    return stats.porCategoria[category] || 0;
  };
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-blue rounded-lg flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Sistema de Validade
            </h1>
            <p className="text-sm text-sidebar-foreground/70 flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Controle Inteligente</span>
            </p>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="mt-4 p-3 bg-sidebar-accent/50 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-sidebar-foreground/70">Status do Sistema</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-success font-medium">Online</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Navegação Inteligente</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={cn(
                        "hover:bg-sidebar-accent transition-all duration-300 group relative overflow-hidden",
                        isCurrentPage && "bg-sidebar-accent border-l-4 border-primary shadow-md"
                      )}
                    >
                      <Link to={item.url} className="flex items-center justify-between py-3 px-3">
                        <div className="flex items-center space-x-3">
                          <item.icon className={cn(
                            "w-5 h-5 transition-all duration-300",
                            isCurrentPage ? "text-primary scale-110" : "group-hover:scale-110"
                          )} />
                          <span className={cn(
                            "font-medium transition-all duration-300",
                            isCurrentPage && "text-primary font-semibold"
                          )}>
                            {item.title}
                          </span>
                        </div>
                        
                        {badgeCount > 0 && (
                          <Badge 
                            variant={isCurrentPage ? "default" : "secondary"} 
                            className={cn(
                              "text-xs transition-all duration-300",
                              isCurrentPage ? "animate-pulse" : "group-hover:scale-110"
                            )}
                          >
                            {badgeCount}
                          </Badge>
                        )}
                        
                        {/* Indicador de página ativa */}
                        {isCurrentPage && (
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-6">
        <div className="space-y-3">
          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-success/10 rounded-lg text-center">
              <div className="text-lg font-bold text-success">{stats.validos}</div>
              <div className="text-xs text-muted-foreground">Válidos</div>
            </div>
            <div className="p-2 bg-destructive/10 rounded-lg text-center">
              <div className="text-lg font-bold text-destructive">{stats.vencidos}</div>
              <div className="text-xs text-muted-foreground">Vencidos</div>
            </div>
          </div>
          
          <div className="text-center text-sm text-sidebar-foreground/60 border-t pt-3">
            <p>© 2024 Sistema de Validade</p>
            <p className="font-medium">Versão 2.0 - Inteligente</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
