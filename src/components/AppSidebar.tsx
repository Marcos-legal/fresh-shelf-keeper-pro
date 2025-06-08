
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
  Calculator
} from "lucide-react";
import { Link } from "react-router-dom";
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
  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-blue rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Sistema de Validade
            </h1>
            <p className="text-sm text-sidebar-foreground/70">
              Controle de Produtos
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="hover:bg-sidebar-accent transition-colors duration-200"
                  >
                    <Link to={item.url} className="flex items-center space-x-3 py-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-6">
        <div className="text-center text-sm text-sidebar-foreground/60">
          <p>© 2024 Sistema de Validade</p>
          <p>Versão 1.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
