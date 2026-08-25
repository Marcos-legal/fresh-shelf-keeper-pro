import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Box,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  Menu,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Refrigerator,
  Snowflake,
  Tag,
  ThermometerSnowflake,
  Truck,
} from "lucide-react";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Product, ProductFormData } from "@/types/product";
import { ProductForm } from "@/components/ProductForm";
import { ProductTable } from "@/components/ProductTable";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardChart } from "@/components/DashboardChart";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const storageConfig = [
  { key: "refrigerado", label: "Refrigerado", icon: ThermometerSnowflake, tone: "blue" },
  { key: "congelado", label: "Congelado", icon: Snowflake, tone: "blue" },
  { key: "ambiente", label: "Ambiente", icon: Home, tone: "amber" },
  { key: "camara-fria", label: "Câmara Fria", icon: Refrigerator, tone: "teal" },
] as const;

const toneClasses = {
  blue: { icon: "bg-blue-50 text-blue-600", bar: "bg-blue-600" },
  amber: { icon: "bg-amber-50 text-amber-500", bar: "bg-amber-400" },
  teal: { icon: "bg-teal-50 text-teal-600", bar: "bg-teal-500" },
};

function dateValue(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: unknown) {
  const date = dateValue(value);
  return date ? date.toLocaleDateString("pt-BR") : "-";
}

function daysFromNow(value: unknown) {
  const date = dateValue(value);
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

function productTargetDate(product: Product) {
  return product.utilizarAte || product.validade;
}

export default function DashboardReference() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, stats } = useProductsSupabase();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const upcoming = useMemo(() => products
    .map((product) => ({ product, days: daysFromNow(productTargetDate(product)) }))
    .filter(({ days }) => days !== null && days > 0 && days <= 30)
    .sort((a, b) => (a.days || 0) - (b.days || 0))
    .slice(0, 4), [products]);

  const expired = useMemo(() => products
    .map((product) => ({ product, days: daysFromNow(productTargetDate(product)) }))
    .filter(({ days, product }) => product.status === "vencido" || (days !== null && days < 0))
    .sort((a, b) => (a.days || 0) - (b.days || 0))
    .slice(0, 4), [products]);

  const handleAdd = (data: ProductFormData) => {
    addProduct(data);
    setShowForm(false);
    toast({ title: "Produto cadastrado", description: "Produto cadastrado com sucesso." });
  };

  const handleEdit = (data: ProductFormData) => {
    if (!editingProduct) return;
    updateProduct(editingProduct.id, data);
    setEditingProduct(null);
    setShowForm(false);
    toast({ title: "Produto atualizado", description: "Produto atualizado com sucesso." });
  };

  const openNew = () => {
    setEditingProduct(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const storageTotal = Math.max(1, stats.total);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900">
        <MobileDrawer />
        <AppSidebar />

        <main className="min-w-0 lg:pl-64 transition-[padding] duration-300">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex h-[76px] max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 min-w-0">
                <button type="button" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
                  <Menu className="h-6 w-6" />
                </button>
                <div className="hidden lg:block h-8 w-px bg-slate-200" />
                <div className="min-w-0">
                  <h1 className="truncate text-[25px] font-bold tracking-[-0.02em] text-slate-900">Dashboard</h1>
                  <p className="hidden text-sm text-slate-500 sm:block">Visão geral do controle de validades</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden items-center gap-2 text-sm text-slate-700 md:flex">
                  <CalendarDays className="h-5 w-5 text-slate-600" />
                  {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <button className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Atualizar">
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" title="Alertas">
                  <Bell className="h-5 w-5" />
                  {stats.vencidos > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1536px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {showForm && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                <ProductForm
                  title={editingProduct ? "Editar Produto" : "Novo Produto"}
                  submitLabel={editingProduct ? "Atualizar Produto" : "Salvar Produto"}
                  initialData={editingProduct || undefined}
                  onSubmit={editingProduct ? handleEdit : handleAdd}
                />
              </div>
            )}

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
              <KpiCard title="Total de Produtos" value={stats.total} description="Todos os itens cadastrados" icon={Box} tone="blue" />
              <KpiCard title="A Vencer (30 dias)" value={stats.proximoVencimento} description="Requer atenção em breve" icon={Clock3} tone="amber" />
              <KpiCard title="Vencidos" value={stats.vencidos} description="Itens vencidos" icon={AlertTriangle} tone="red" />
              <KpiCard title="Válidos" value={stats.validos} description="Dentro da validade" icon={CheckCircle2} tone="green" />
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Produtos por Armazenamento</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {storageConfig.map((item) => {
                  const count = stats.porCategoria[item.key] || 0;
                  const tone = toneClasses[item.tone];
                  const percentage = Math.min(100, Math.max(7, Math.round((count / storageTotal) * 100)));
                  return (
                    <button key={item.key} onClick={() => navigate(`/${item.key}`)} className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-full", tone.icon)}><item.icon className="h-6 w-6" /></div>
                      </div>
                      <p className="mt-3 text-sm font-medium text-slate-700">{item.label}</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>
                      <p className="text-xs text-slate-500">Itens</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${percentage}%` }} /></div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Visão dos Indicadores</h2>
                <p className="mt-1 text-sm text-slate-500">Distribuição dos produtos por armazenamento e situação de validade.</p>
              </div>
              <DashboardChart categoryData={stats.porCategoria} statusData={{ validos: stats.validos, proximoVencimento: stats.proximoVencimento, vencidos: stats.vencidos }} />
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-2">
              <ProductListCard title="Próximos a vencer" items={upcoming} empty="Nenhum produto vencendo nos próximos dias." variant="warning" onViewAll={() => navigate("/relatorios")} />
              <ProductListCard title="Produtos vencidos" items={expired} empty="Nenhum produto vencido." variant="danger" onViewAll={() => navigate("/relatorios")} />
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">Ações Rápidas</h2></div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <QuickAction icon={Plus} label="Novo Produto" onClick={openNew} tone="blue" />
                <QuickAction icon={Tag} label="Gerar Etiquetas" onClick={() => navigate("/impressao-etiquetas")} tone="green" />
                <QuickAction icon={QrCode} label="Ler QR Code" onClick={() => navigate("/leitor-qrcode")} tone="purple" />
                <QuickAction icon={Truck} label="Relatório de Validades" onClick={() => navigate("/relatorios")} tone="amber" />
              </div>
            </section>

            <section className="mt-5">
              <ProductTable products={products} title="Todos os Produtos" onEdit={openEdit} onDelete={(id) => { deleteProduct(id); toast({ title: "Produto excluído", description: "Produto excluído com sucesso." }); }} />
            </section>

            <footer className="flex flex-col gap-2 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>ValiControl - Controle de Validades</span><span>Versão 2.0.0</span></footer>
          </div>
        </main>

        <button type="button" onClick={openNew} className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 lg:hidden" aria-label="Novo produto"><Plus className="h-7 w-7" /></button>
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/98 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] lg:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-4">
            <MobileNav icon={Home} label="Dashboard" active onClick={() => navigate("/")} />
            <MobileNav icon={Box} label="Estoque" onClick={() => navigate("/contagem-estoque")} />
            <MobileNav icon={Tag} label="Etiquetas" onClick={() => navigate("/impressao-etiquetas")} />
            <MobileNav icon={Menu} label="Mais" onClick={() => setMobileMenuOpen(true)} />
          </div>
        </nav>
      </div>
    </SidebarProvider>
  );
}

function KpiCard({ title, value, description, icon: Icon, tone }: { title: string; value: number; description: string; icon: typeof Box; tone: "blue" | "amber" | "red" | "green" }) {
  const styles = { blue: { icon: "bg-blue-50 text-blue-600", value: "text-slate-900" }, amber: { icon: "bg-amber-50 text-amber-500", value: "text-slate-900" }, red: { icon: "bg-red-50 text-red-500", value: "text-slate-900" }, green: { icon: "bg-green-50 text-green-600", value: "text-slate-900" } }[tone];
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start gap-3"><div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", styles.icon)}><Icon className="h-6 w-6" /></div><div className="min-w-0"><p className="truncate text-xs font-medium text-slate-600 sm:text-sm">{title}</p><p className={cn("mt-1 text-2xl font-bold sm:text-[28px]", styles.value)}>{value}</p><p className="mt-1 hidden text-xs text-slate-500 sm:block">{description}</p></div></div></div>;
}

function ProductListCard({ title, items, empty, variant, onViewAll }: { title: string; items: { product: Product; days: number | null }[]; empty: string; variant: "warning" | "danger"; onViewAll: () => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">{title}</h2><button onClick={onViewAll} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">Ver todos <ChevronRight className="h-4 w-4" /></button></div><div className="divide-y divide-slate-100">{items.length === 0 && <p className="py-8 text-center text-sm text-slate-400">{empty}</p>}{items.map(({ product, days }) => <div key={product.id} className="flex items-center gap-3 py-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500"><Package className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{product.nome || "Produto sem nome"}</p><p className={cn("text-xs", variant === "danger" ? "text-red-500" : "text-amber-500")}>{variant === "danger" ? `Vencido há ${Math.max(1, Math.abs(days || 0))} dias` : `Vence em ${days} dias`}</p></div><div className="hidden text-right sm:block"><span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-600">{product.localArmazenamento === "camara-fria" ? "Câmara Fria" : product.localArmazenamento === "congelado" ? "Congelado" : product.localArmazenamento === "ambiente" ? "Ambiente" : "Refrigerado"}</span><p className="mt-1 text-xs text-slate-500">{formatDate(productTargetDate(product))}</p></div></div>)}</div></div>;
}

function QuickAction({ icon: Icon, label, onClick, tone }: { icon: typeof Plus; label: string; onClick: () => void; tone: "blue" | "green" | "purple" | "amber" }) {
  const styles = { blue: "text-blue-600", green: "text-green-600", purple: "text-purple-600", amber: "text-amber-500" }[tone];
  return <button onClick={onClick} className="flex min-h-16 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"><Icon className={cn("h-5 w-5", styles)} />{label}</button>;
}

function MobileNav({ icon: Icon, label, active, onClick }: { icon: typeof Home; label: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={cn("flex flex-col items-center gap-1 py-1 text-[10px] font-medium", active ? "text-blue-600" : "text-slate-500")}><Icon className="h-5 w-5" />{label}</button>;
}
