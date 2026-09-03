import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, Bell, Box, CalendarDays, CheckCircle2, ChevronRight, Clock3,
  Home, Menu, Package, Plus, QrCode, RefreshCw, Refrigerator, Snowflake, Tag,
  ThermometerSnowflake, Truck, CircleAlert, ArrowUpRight,
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
function productTargetDate(product: Product) { return product.utilizarAte || product.validade; }
function toInputDate(value: unknown) {
  const date = dateValue(value);
  return date ? date.toISOString().slice(0, 10) : "";
}
function toFormData(product: Product): Partial<ProductFormData> {
  return {
    nome: product.nome,
    lote: product.lote,
    marca: product.marca,
    dataFabricacao: toInputDate(product.dataFabricacao),
    validade: toInputDate(product.validade),
    dataAbertura: toInputDate(product.dataAbertura),
    diasParaVencer: product.diasParaVencer,
    localArmazenamento: product.localArmazenamento,
    responsavel: product.responsavel,
    precoCusto: product.precoCusto,
    showOptionalDates: product.showOptionalDates,
  };
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
    .sort((a, b) => (a.days || 0) - (b.days || 0)).slice(0, 5), [products]);

  const expired = useMemo(() => products
    .map((product) => ({ product, days: daysFromNow(productTargetDate(product)) }))
    .filter(({ days, product }) => product.status === "vencido" || (days !== null && days < 0))
    .sort((a, b) => (a.days || 0) - (b.days || 0)).slice(0, 5), [products]);

  const attention = [
    { value: stats.vencidos, label: "Produtos vencidos", detail: "Precisam de ação agora", tone: "danger", action: () => navigate("/relatorios") },
    { value: upcoming.filter(({ days }) => days !== null && days <= 7).length, label: "Vencem nesta semana", detail: "Confira antes da próxima compra", tone: "warning", action: () => navigate("/relatorios") },
    { value: stats.proximoVencimento, label: "Vencem em 30 dias", detail: "Planeje o consumo e reposição", tone: "warning", action: () => navigate("/relatorios") },
  ];

  const handleAdd = (data: ProductFormData) => { addProduct(data); setShowForm(false); toast({ title: "Produto cadastrado", description: "Produto cadastrado com sucesso." }); };
  const handleEdit = (data: ProductFormData) => { if (!editingProduct) return; updateProduct(editingProduct.id, data); setEditingProduct(null); setShowForm(false); toast({ title: "Produto atualizado", description: "Produto atualizado com sucesso." }); };
  const openNew = () => { setEditingProduct(null); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openEdit = (product: Product) => { setEditingProduct(product); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-slate-50 text-slate-900">
        <MobileDrawer />
        <AppSidebar />
        <main className="min-w-0 lg:pl-64">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="mx-auto flex min-h-[68px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button type="button" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(true)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
                <div className="min-w-0"><h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Dashboard</h1><p className="hidden text-sm text-slate-500 sm:block">Visão geral do controle de validades</p></div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                <div className="hidden items-center gap-2 text-sm text-slate-600 md:flex"><CalendarDays className="h-4 w-4 text-slate-400" />{new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</div>
                <button className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Atualizar"><RefreshCw className="h-4 w-4" /></button>
                <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden" title="Alertas"><Bell className="h-5 w-5" />{stats.vencidos > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}</button>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {showForm && <div className="mb-5 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"><ProductForm title={editingProduct ? "Editar Produto" : "Novo Produto"} submitLabel={editingProduct ? "Atualizar Produto" : "Salvar Produto"} initialData={editingProduct || undefined} onSubmit={editingProduct ? handleEdit : handleAdd} /></div>}

            <div className="mb-5 flex flex-col gap-1"><p className="text-sm font-medium text-slate-500">Resumo do estoque</p><h2 className="text-lg font-semibold text-slate-900">Olá! Aqui está o que precisa da sua atenção hoje.</h2></div>

            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
              <KpiCard title="Produtos" value={stats.total} description="Total cadastrado" icon={Box} tone="blue" />
              <KpiCard title="Válidos" value={stats.validos} description="Dentro da validade" icon={CheckCircle2} tone="green" />
              <KpiCard title="Vencendo em 30 dias" value={stats.proximoVencimento} description="Requer atenção" icon={Clock3} tone="amber" />
              <KpiCard title="Vencidos" value={stats.vencidos} description="Ação necessária" icon={AlertTriangle} tone="red" />
            </section>

            <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-semibold text-slate-900">O que precisa da sua atenção</h2><p className="mt-0.5 text-xs text-slate-500">Prioridades para reduzir perdas e manter o estoque em dia.</p></div><CircleAlert className="hidden h-5 w-5 text-slate-400 sm:block" /></div>
              <div className="grid gap-2 md:grid-cols-3">{attention.map((item) => <AttentionItem key={item.label} {...item} />)}</div>
            </section>

            <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-semibold text-slate-900">Produtos por armazenamento</h2><p className="text-xs text-slate-500">Distribuição atual do estoque.</p></div><button onClick={() => navigate("/relatorios")} className="hidden items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 sm:flex">Ver relatório <ArrowUpRight className="h-3.5 w-3.5" /></button></div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{storageConfig.map((item) => { const count = stats.porCategoria[item.key] || 0; const tone = toneClasses[item.tone]; const total = Math.max(1, stats.total); const percentage = Math.round((count / total) * 100); return <button key={item.key} onClick={() => navigate(`/${item.key}`)} className="rounded-md border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-slate-50"><div className="flex items-center gap-2"><span className={cn("flex h-8 w-8 items-center justify-center rounded-md", tone.icon)}><item.icon className="h-4 w-4" /></span><span className="truncate text-xs font-medium text-slate-600">{item.label}</span></div><div className="mt-3 flex items-end justify-between"><span className="text-xl font-semibold text-slate-900">{count}</span><span className="text-[11px] text-slate-400">{percentage}%</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full", tone.bar)} style={{ width: `${Math.max(count ? 5 : 0, percentage)}%` }} /></div></button>; })}</div>
            </section>

            <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-3"><h2 className="text-base font-semibold text-slate-900">Indicadores</h2><p className="text-xs text-slate-500">Visualize onde estão os produtos e como estão as validades.</p></div>
              <DashboardChart categoryData={stats.porCategoria} statusData={{ validos: stats.validos, proximoVencimento: stats.proximoVencimento, vencidos: stats.vencidos }} />
            </section>

            <section className="mt-5 grid gap-4 lg:grid-cols-2">
              <ProductListCard title="Próximos a vencer" items={upcoming} empty="Nenhum produto vencendo nos próximos dias." variant="warning" onViewAll={() => navigate("/relatorios")} />
              <ProductListCard title="Produtos vencidos" items={expired} empty="Nenhum produto vencido." variant="danger" onViewAll={() => navigate("/relatorios")} />
            </section>

            <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-semibold text-slate-900">Ações rápidas</h2><p className="text-xs text-slate-500">Atalhos para as tarefas mais usadas.</p></div></div>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4"><QuickAction icon={Plus} label="Novo Produto" onClick={openNew} tone="blue" /><QuickAction icon={Tag} label="Gerar Etiquetas" onClick={() => navigate("/impressao-etiquetas")} tone="green" /><QuickAction icon={QrCode} label="Ler QR Code" onClick={() => navigate("/leitor-qrcode")} tone="purple" /><QuickAction icon={Truck} label="Relatórios" onClick={() => navigate("/relatorios")} tone="amber" /></div>
            </section>

            <section className="mt-5"><ProductTable products={products} title="Todos os Produtos" onEdit={openEdit} onDelete={(id) => { deleteProduct(id); toast({ title: "Produto excluído", description: "Produto excluído com sucesso." }); }} /></section>
            <footer className="flex flex-col gap-2 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>ValiControl · Controle de Validades</span><span>Versão 2.0.0</span></footer>
          </div>
        </main>

        <button type="button" onClick={openNew} className="fixed bottom-20 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700 lg:hidden" aria-label="Novo produto"><Plus className="h-6 w-6" /></button>
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-4"><MobileNav icon={Home} label="Dashboard" active onClick={() => navigate("/")} /><MobileNav icon={Box} label="Estoque" onClick={() => navigate("/contagem-estoque")} /><MobileNav icon={Tag} label="Etiquetas" onClick={() => navigate("/impressao-etiquetas")} /><MobileNav icon={Menu} label="Mais" onClick={() => setMobileMenuOpen(true)} /></div></nav>
      </div>
    </SidebarProvider>
  );
}

function KpiCard({ title, value, description, icon: Icon, tone }: { title: string; value: number; description: string; icon: typeof Box; tone: "blue" | "amber" | "red" | "green" }) {
  const styles = { blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-500", red: "bg-red-50 text-red-500", green: "bg-green-50 text-green-600" }[tone];
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start gap-3"><div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", styles)}><Icon className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-xs font-medium text-slate-500 sm:text-sm">{title}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[27px]">{value}</p><p className="mt-0.5 hidden text-xs text-slate-400 sm:block">{description}</p></div></div></div>;
}

function AttentionItem({ value, label, detail, tone, action }: { value: number; label: string; detail: string; tone: "danger" | "warning"; action: () => void }) {
  const danger = tone === "danger";
  return <button onClick={action} className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 p-3 text-left transition hover:bg-slate-50"><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", danger ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500")}><AlertTriangle className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{value} {label}</span><span className="block truncate text-xs text-slate-500">{detail}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-slate-300" /></button>;
}

function ProductListCard({ title, items, empty, variant, onViewAll }: { title: string; items: { product: Product; days: number | null }[]; empty: string; variant: "warning" | "danger"; onViewAll: () => void }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5"><div className="mb-2 flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-slate-900">{title}</h2><button onClick={onViewAll} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">Ver todos <ChevronRight className="h-3.5 w-3.5" /></button></div><div className="divide-y divide-slate-100">{items.length === 0 && <p className="py-8 text-center text-sm text-slate-400">{empty}</p>}{items.map(({ product, days }) => <div key={product.id} className="flex items-center gap-3 py-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500"><Package className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{product.nome || "Produto sem nome"}</p><p className={cn("text-xs", variant === "danger" ? "text-red-500" : "text-amber-500")}>{variant === "danger" ? `Vencido há ${Math.max(1, Math.abs(days || 0))} dias` : `Vence em ${days} dias`}</p></div><div className="hidden text-right sm:block"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">{product.localArmazenamento === "camara-fria" ? "Câmara Fria" : product.localArmazenamento === "congelado" ? "Congelado" : product.localArmazenamento === "ambiente" ? "Ambiente" : "Refrigerado"}</span><p className="mt-1 text-xs text-slate-400">{formatDate(productTargetDate(product))}</p></div></div>)}</div></div>;
}

function QuickAction({ icon: Icon, label, onClick, tone }: { icon: typeof Plus; label: string; onClick: () => void; tone: "blue" | "green" | "purple" | "amber" }) {
  const styles = { blue: "text-blue-600", green: "text-green-600", purple: "text-violet-600", amber: "text-amber-500" }[tone];
  return <button onClick={onClick} className="flex min-h-14 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"><Icon className={cn("h-4 w-4", styles)} />{label}</button>;
}

function MobileNav({ icon: Icon, label, active, onClick }: { icon: typeof Home; label: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={cn("flex flex-col items-center gap-1 py-1 text-[10px] font-medium", active ? "text-blue-600" : "text-slate-500")}><Icon className="h-5 w-5" />{label}</button>;
}
