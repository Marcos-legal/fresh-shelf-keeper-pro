import {
  LayoutDashboard, Snowflake, Thermometer, Home, Refrigerator, Package,
  FileText, Printer, Eye, Calculator, QrCode,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { EmpresaSwitcher } from "./EmpresaSwitcher";

const navSections = [
  { label: "Visão Geral", items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] },
  { label: "Armazenamento", items: [
    { title: "Refrigerado", url: "/refrigerado", icon: Thermometer },
    { title: "Congelado", url: "/congelado", icon: Snowflake },
    { title: "Ambiente", url: "/ambiente", icon: Home },
    { title: "Câmara Fria", url: "/camara-fria", icon: Refrigerator },
  ] },
  { label: "Operações", items: [
    { title: "Cadastro", url: "/cadastro", icon: Package },
    { title: "Estoque", url: "/contagem-estoque", icon: Calculator },
    { title: "Etiquetas", url: "/impressao-etiquetas", icon: Printer },
    { title: "Visualizar", url: "/visualizar-etiquetas", icon: Eye },
    { title: "Leitor QR", url: "/leitor-qrcode", icon: QrCode },
    { title: "Relatórios", url: "/relatorios", icon: FileText },
  ] },
];

export function AppSidebar() {
  const location = useLocation();
  const { stats } = useProductsSupabase();
  const getCategoryCount = (category: string) => stats.porCategoria[category] || 0;
  const isActive = (path: string) => location.pathname === path;
  const getBadgeCount = (url: string) => {
    if (url === "/") return stats.total;
    if (url === "/refrigerado") return getCategoryCount("refrigerado");
    if (url === "/congelado") return getCategoryCount("congelado");
    if (url === "/ambiente") return getCategoryCount("ambiente");
    if (url === "/camara-fria") return getCategoryCount("camara-fria");
    return 0;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">
      <Sidebar className="h-full w-full border-r border-slate-200 bg-white text-slate-700 shadow-[2px_0_12px_rgba(15,23,42,0.04)]">
        <SidebarHeader className="border-b border-slate-100 bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Package className="h-[18px] w-[18px] text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold tracking-tight text-slate-900">ValiControl</h1>
              <p className="truncate text-[10px] text-slate-500">Controle de Validades</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <EmpresaSwitcher />
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Conta</span>
            <UserMenu />
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-white px-2 py-2">
          {navSections.map((section) => (
            <SidebarGroup key={section.label} className="py-2">
              <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const active = isActive(item.url);
                    const count = getBadgeCount(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "mx-0.5 mb-0.5 h-9 rounded-md px-2.5 transition-colors",
                            active
                              ? "bg-blue-50 text-primary font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <Link to={item.url} className="flex items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2.5">
                              <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-slate-400")} />
                              <span className="truncate text-[13px]">{item.title}</span>
                            </span>
                            {count > 0 && (
                              <span className={cn(
                                "inline-flex h-[19px] min-w-[19px] shrink-0 items-center justify-center rounded-full px-1 text-[9px] font-semibold",
                                active ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                              )}>
                                {count > 999 ? "999+" : count}
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

        <SidebarFooter className="border-t border-slate-100 bg-white p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-center">
              <div className="text-base font-bold leading-none text-success">{stats.validos}</div>
              <div className="mt-1 text-[9px] font-medium text-slate-500">Válidos</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-center">
              <div className="text-base font-bold leading-none text-destructive">{stats.vencidos}</div>
              <div className="mt-1 text-[9px] font-medium text-slate-500">Vencidos</div>
            </div>
          </div>
          <div className="mt-2 text-center text-[9px] text-slate-400">ValiControl · v2.0</div>
        </SidebarFooter>
      </Sidebar>
    </aside>
  );
}
