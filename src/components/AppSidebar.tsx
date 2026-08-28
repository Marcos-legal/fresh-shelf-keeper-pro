import { useEffect } from "react";
import {
  LayoutDashboard, Snowflake, Thermometer, Home, Refrigerator, Package,
  FileText, Printer, Eye, Calculator, QrCode, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
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
  const { state, toggleSidebar, isMobile } = useSidebar();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--valicontrol-sidebar-width",
      isMobile ? "0px" : state === "expanded" ? "13.25rem" : "3.5rem"
    );
  }, [state, isMobile]);

  const getCategoryCount = (category: string) => stats.porCategoria[category] || 0;
  const getBadgeCount = (url: string) => {
    if (url === "/") return stats.total;
    if (url === "/refrigerado") return getCategoryCount("refrigerado");
    if (url === "/congelado") return getCategoryCount("congelado");
    if (url === "/ambiente") return getCategoryCount("ambiente");
    if (url === "/camara-fria") return getCategoryCount("camara-fria");
    return 0;
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden lg:block transition-[width] duration-200 ease-out",
        state === "expanded" ? "w-[13.25rem]" : "w-[3.5rem]"
      )}
      aria-label="Navegação principal"
    >
      <Sidebar collapsible="none" className="h-full w-full border-r border-slate-200 bg-white text-slate-700 shadow-[1px_0_8px_rgba(15,23,42,0.035)]">
        <SidebarHeader className={cn("border-b border-slate-100 bg-white py-3", state === "expanded" ? "px-3" : "px-1")}>
          <div className={cn("flex items-center", state === "expanded" ? "gap-2.5" : "justify-center")}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary"><Package className="h-4 w-4 text-primary-foreground" /></div>
            {state === "expanded" && <div className="min-w-0"><h1 className="text-sm font-bold tracking-tight text-slate-900">ValiControl</h1><p className="truncate text-[9px] text-slate-500">Controle de Validades</p></div>}
          </div>
          {state === "expanded" && <><div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5"><EmpresaSwitcher /></div><div className="mt-2 flex items-center justify-between px-0.5"><span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">Conta</span><UserMenu /></div></>}
          <button type="button" onClick={toggleSidebar} aria-label={state === "expanded" ? "Recolher menu" : "Expandir menu"} title={state === "expanded" ? "Recolher menu" : "Expandir menu"} className={cn("mt-2 flex h-7 items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800", state === "expanded" ? "w-full justify-end px-1.5" : "w-full justify-center")}>
            {state === "expanded" ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
          </button>
        </SidebarHeader>
        <SidebarContent className={cn("bg-white py-1.5", state === "expanded" ? "px-1.5" : "px-0.5")}>
          {navSections.map((section) => <SidebarGroup key={section.label} className="py-1.5">
            {state === "expanded" ? <SidebarGroupLabel className="h-6 px-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">{section.label}</SidebarGroupLabel> : <div className="my-1 border-t border-slate-100" />}
            <SidebarGroupContent><SidebarMenu>{section.items.map((item) => {
              const active = location.pathname === item.url;
              const count = getBadgeCount(item.url);
              return <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={active} className={cn("mb-0.5 h-9 rounded-md transition-colors", state === "expanded" ? "px-2" : "justify-center px-0", active ? "bg-blue-50 font-semibold text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}>
                  <Link to={item.url} className={cn("flex w-full items-center", state === "expanded" ? "justify-between gap-2" : "justify-center")}>
                    <span className={cn("flex min-w-0 items-center", state === "expanded" ? "gap-2.5" : "justify-center")}><item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-slate-400")} />{state === "expanded" && <span className="truncate text-[12px]">{item.title}</span>}</span>
                    {state === "expanded" && count > 0 && <span className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-slate-100 px-1 text-[9px] font-semibold text-slate-500">{count > 999 ? "999+" : count}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>;
            })}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>)}
        </SidebarContent>
        <SidebarFooter className={cn("border-t border-slate-100 bg-white", state === "expanded" ? "p-2" : "p-1")}>
          {state === "expanded" && <div className="grid grid-cols-2 gap-1.5"><div className="rounded-md border border-slate-200 bg-slate-50 p-1.5 text-center"><div className="text-sm font-bold leading-none text-success">{stats.validos}</div><div className="mt-0.5 text-[8px] font-medium text-slate-500">Válidos</div></div><div className="rounded-md border border-slate-200 bg-slate-50 p-1.5 text-center"><div className="text-sm font-bold leading-none text-destructive">{stats.vencidos}</div><div className="mt-0.5 text-[8px] font-medium text-slate-500">Vencidos</div></div></div>}
        </SidebarFooter>
      </Sidebar>
    </aside>
  );
}
