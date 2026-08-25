import { useEffect, useRef, useState } from "react";
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
import { EmpresaSwitcher } from "./EmpresaSwitcher";

const navSections = [
  {
    label: "Visão Geral",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
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
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 24) setVisible(true);
      else if (currentScrollY > lastScrollY.current + 8) setVisible(false);
      else if (currentScrollY < lastScrollY.current - 8) setVisible(true);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-svh w-[16rem] transition-transform duration-300 ease-out lg:block",
        visible ? "translate-x-0" : "-translate-x-full"
      )}
      aria-hidden={!visible}
    >
      <Sidebar className="h-full w-full border-r border-slate-200 bg-slate-50 text-slate-700">
        <SidebarHeader className="p-4 pb-3 bg-white">
          <div className="flex items-center gap-3 px-1">
            <div className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5 text-primary-foreground" />
              <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-800 tracking-tight">ValiControl</h1>
              <p className="text-[10px] text-slate-500 truncate">Controle de Validades</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-2.5"><EmpresaSwitcher /></div>
          <div className="mt-2.5 flex items-center justify-between px-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Conta</span>
            <UserMenu />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-1 bg-slate-50">
          {navSections.map((section) => (
            <SidebarGroup key={section.label} className="py-2">
              <SidebarGroupLabel className="h-7 text-[9px] uppercase tracking-[0.14em] text-slate-400 font-bold px-3">{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isCurrentPage = isActive(item.url);
                    const badgeCount = getBadgeCount(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className={cn(
                          "h-10 transition-all duration-200 rounded-xl mx-1",
                          isCurrentPage ? "bg-primary/10 text-primary font-semibold shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900"
                        )}>
                          <Link to={item.url} className="flex items-center justify-between py-2 px-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <item.icon className={cn("w-[17px] h-[17px] shrink-0", isCurrentPage ? "text-primary" : "text-slate-400")} />
                              <span className="text-sm truncate">{item.title}</span>
                            </div>
                            {badgeCount > 0 && <span className={cn(
                              "text-[9px] font-bold min-w-5 h-5 px-1.5 rounded-full inline-flex items-center justify-center",
                              isCurrentPage ? "bg-primary/15 text-primary" : "bg-slate-200 text-slate-500"
                            )}>{badgeCount > 999 ? '999+' : badgeCount}</span>}
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
        <SidebarFooter className="p-3 bg-slate-50">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2">
            <div className="p-2 rounded-lg bg-success/8 text-center"><div className="text-lg font-bold text-success leading-none">{stats.validos}</div><div className="text-[9px] font-medium text-slate-500 mt-1">Válidos</div></div>
            <div className="p-2 rounded-lg bg-destructive/8 text-center"><div className="text-lg font-bold text-destructive leading-none">{stats.vencidos}</div><div className="text-[9px] font-medium text-slate-500 mt-1">Vencidos</div></div>
          </div>
          <div className="text-center text-[9px] text-slate-400 mt-2">ValiControl · v2.0</div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
