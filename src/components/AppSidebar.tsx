
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
  QrCode,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
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
import { UserMenu } from "./UserMenu";

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
      { title: "Leitor QR", url: "/leitor-qrcode", icon: QrCode },
      { title: "Relatórios", url: "/relatorios", icon: FileText },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { stats } = useProductsSupabase();
  
  const getCategoryCount = (category: string) => stats.porCategoria[category] || 0;
  const isActive = (path: string) => location.pathname === path;

  const getBadgeCount = (url: string) => {
    if (url === '/') return stats.total;
    if (url === '/refrigerado') return getCategoryCount('refrigerado');
    if (url === '/congelado') return getCategoryCount('congelado');
    if (url === '/ambiente') return getCategoryCount('ambiente');
    if (url === '/camara-fria') return getCategoryCount('camara-fria');
    return 0;
  };

  return (
    <Sidebar className="hidden lg:block border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-5 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">
              ValiControl
            </h1>
            <p className="text-[11px] text-sidebar-foreground/50">
              Controle de Validades
            </p>
          </div>
        </div>

        {/* User Menu */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-sidebar-border">
          <span className="text-xs text-sidebar-foreground/50">Conta</span>
          <UserMenu />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold px-4">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isCurrentPage = isActive(item.url);
                  const badgeCount = getBadgeCount(item.url);
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(
                          "transition-all duration-200 rounded-lg mx-2",
                          isCurrentPage 
                            ? "bg-primary/10 text-primary font-semibold" 
                            : "hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground"
                        )}
                      >
                        <Link to={item.url} className="flex items-center justify-between py-2 px-3">
                          <div className="flex items-center gap-3">
                            <item.icon className={cn(
                              "w-4 h-4",
                              isCurrentPage ? "text-primary" : "text-sidebar-foreground/50"
                            )} />
                            <span className="text-sm">{item.title}</span>
                          </div>
                          
                          {badgeCount > 0 && (
                            <span className={cn(
                              "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                              isCurrentPage 
                                ? "bg-primary/20 text-primary" 
                                : "bg-sidebar-accent text-sidebar-foreground/50"
                            )}>
                              {badgeCount}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="p-4">
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
        <div className="text-center text-[10px] text-sidebar-foreground/30 mt-3">
          © 2024 ValiControl v2.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
