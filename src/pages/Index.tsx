import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Product, ProductFormData } from "@/types/product";
import { ProductTable } from "@/components/ProductTable";
import { ProductForm } from "@/components/ProductForm";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Plus, Package, CheckCircle, AlertTriangle, XCircle, Thermometer, Snowflake, Home, Refrigerator, Clock, Printer, Eye, LayoutDashboard, QrCode } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardChart } from "@/components/DashboardChart";
import { Skeleton } from "@/components/ui/skeleton";
import { escapeHtml } from "@/lib/security";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const { products, loading, addProduct, updateProduct, deleteProduct, stats, getProductsByCategory } = useProductsSupabase();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'validos' | 'proximo-vencimento' | 'vencidos'>('todos');

  const handleAddProduct = (data: ProductFormData) => {
    addProduct(data);
    setShowForm(false);
    toast({ title: "Produto cadastrado", description: "Produto foi cadastrado com sucesso!" });
  };

  const handleEditProduct = (data: ProductFormData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      setEditingProduct(null);
      setShowForm(false);
      toast({ title: "Produto atualizado", description: "Produto foi atualizado com sucesso!" });
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast({ title: "Produto excluído", description: "Produto foi excluído com sucesso!", variant: "destructive" });
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handlePrintLabel = (product: Product) => {
    const largura = parseInt(localStorage.getItem('etiqueta-largura') || '70');
    const altura = parseInt(localStorage.getItem('etiqueta-altura') || '50');
    
    const formatDateSafe = (dateValue: any): string => {
      if (!dateValue) return '';
      try {
        let date: Date | null = null;
        if (dateValue instanceof Date) { date = dateValue; }
        else if (typeof dateValue === 'string') {
          if (dateValue.includes('/')) return dateValue;
          const [year, month, day] = dateValue.split('-').map(Number);
          if (year && month && day) date = new Date(year, month - 1, day);
        }
        if (date && !isNaN(date.getTime())) return date.toLocaleDateString('pt-BR');
        return dateValue;
      } catch { return ''; }
    };

    const area = largura * altura;
    const fontSize = Math.max(10, Math.min(14, area / 350));
    const config = {
      width: `${largura * 3.78}px`, height: `${altura * 3.78}px`,
      fontSize: `${fontSize}px`, labelSize: `${fontSize - 1}px`, contentSize: `${fontSize}px`,
      padding: `${Math.max(6, largura * 0.085)}px`, spacing: `${Math.max(3, altura * 0.06)}px`,
      showGrid: (largura / altura) > 1.2, compactMode: area < 2500
    };

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Etiqueta - ${escapeHtml(product.nome || '')}</title>
        <style>
          @page { size: A4; margin: 0.5cm; }
          body { font-family: 'Courier New', monospace; margin: 0; padding: 0; line-height: 1.1; }
          .etiqueta { border: 3px solid #000; width: ${config.width}; height: ${config.height}; margin: 8px; padding: ${config.padding}; font-size: ${config.fontSize}; background: white; font-weight: 600; color: #000; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
          .campo { margin-bottom: ${config.spacing}; border-bottom: 2px solid #333; padding-bottom: 2px; font-weight: bold; overflow: hidden; }
          .label { font-weight: 900; font-size: ${config.labelSize}; text-transform: uppercase; line-height: 1; }
          .content { font-weight: 800; font-size: ${config.contentSize}; text-transform: uppercase; margin-top: 2px; word-wrap: break-word; overflow: hidden; line-height: 1.1; }
          .grid { display: ${config.showGrid ? 'grid' : 'block'}; grid-template-columns: ${config.showGrid ? '1fr 1fr' : '1fr'}; gap: 4px; margin-bottom: ${config.spacing}; }
          .checkbox-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; font-size: ${config.labelSize}; margin-bottom: ${config.spacing}; font-weight: 900; }
          .checkbox-item { display: flex; align-items: center; font-weight: 900; }
          .checkbox-mark { font-size: 12px; font-weight: 900; margin-right: 2px; }
        </style></head><body>
        <div class="etiqueta">
          <div class="campo"><div class="label">PRODUTO:</div><div class="content">${escapeHtml((product.nome || '').toUpperCase())}</div></div>
          <div class="grid">
            <div class="campo"><div class="label">LOTE:</div><div class="content">${escapeHtml((product.lote || '').toUpperCase())}</div></div>
            <div class="campo"><div class="label">MARCA:</div><div class="content">${escapeHtml((product.marca || '').toUpperCase())}</div></div>
          </div>
          <div class="grid">
            <div class="campo"><div class="label">ABERTURA:</div><div class="content">${escapeHtml(formatDateSafe(product.dataAbertura))}</div></div>
            <div class="campo"><div class="label">USAR ATÉ:</div><div class="content">${escapeHtml(formatDateSafe(product.utilizarAte))}</div></div>
          </div>
          <div class="checkbox-row">
            <div class="checkbox-item"><span class="checkbox-mark">${product.localArmazenamento === 'refrigerado' ? '■' : '□'}</span><span>REF</span></div>
            <div class="checkbox-item"><span class="checkbox-mark">${product.localArmazenamento === 'congelado' ? '■' : '□'}</span><span>CON</span></div>
            <div class="checkbox-item"><span class="checkbox-mark">${product.localArmazenamento === 'ambiente' ? '■' : '□'}</span><span>AMB</span></div>
          </div>
          ${!config.compactMode ? `<div class="campo"><div class="label">RESPONSÁVEL:</div><div class="content">${escapeHtml((product.responsavel || '').toUpperCase())}</div></div>` : ''}
        </div></body></html>`);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
    toast({ title: "Etiqueta enviada", description: `Etiqueta de ${product.nome} enviada para impressão!` });
  };

  const proximosVencimento = products.filter(product => {
    const now = new Date();
    let targetDate: Date | undefined;
    if (product.utilizarAte instanceof Date) targetDate = product.utilizarAte;
    else if (product.validade instanceof Date) targetDate = product.validade;
    if (!targetDate) return false;
    const daysToExpire = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysToExpire <= 2 && daysToExpire > 0;
  });

  const produtosVencidos = products.filter(product => product.status === 'vencido');

  const filteredProducts = (() => {
    switch (activeFilter) {
      case 'validos': return products.filter(p => p.status === 'valido');
      case 'proximo-vencimento': return proximosVencimento;
      case 'vencidos': return produtosVencidos;
      default: return products;
    }
  })();

  const filterTitles: Record<string, string> = {
    'todos': 'Todos os Produtos',
    'validos': 'Produtos Válidos',
    'proximo-vencimento': 'Produtos Próximos do Vencimento',
    'vencidos': 'Produtos Vencidos',
  };

  if (loading) {
    return (
      <PageLayout title="Dashboard" description="Carregando..." icon={LayoutDashboard}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  const storageLocations = [
    { name: "Refrigerado", icon: Thermometer, url: "/refrigerado", count: stats.porCategoria.refrigerado, color: "text-primary" },
    { name: "Congelado", icon: Snowflake, url: "/congelado", count: stats.porCategoria.congelado, color: "text-primary" },
    { name: "Ambiente", icon: Home, url: "/ambiente", count: stats.porCategoria.ambiente, color: "text-primary" },
    { name: "Câmara Fria", icon: Refrigerator, url: "/camara-fria", count: stats.porCategoria['camara-fria'], color: "text-primary" },
  ];

  return (
    <PageLayout 
      title="Dashboard" 
      description="Visão geral do controle de validades"
      icon={LayoutDashboard}
      headerActions={
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            onClick={() => { setEditingProduct(null); setShowForm(!showForm); }} 
            size="sm" className="text-sm h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">{showForm ? 'Cancelar' : 'Novo Produto'}</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      }
    >
      {/* Alert Banners */}
      {(produtosVencidos.length > 0 || proximosVencimento.length > 0) && (
        <div className="flex flex-col gap-2 sm:gap-3 mb-5 sm:mb-6">
          {produtosVencidos.length > 0 && (
            <div 
              className="alert-banner-danger cursor-pointer active:opacity-80 transition-opacity"
              onClick={() => setActiveFilter(activeFilter === 'vencidos' ? 'todos' : 'vencidos')}
            >
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{produtosVencidos.length} produto{produtosVencidos.length !== 1 ? 's' : ''} vencido{produtosVencidos.length !== 1 ? 's' : ''} — ação imediata necessária</span>
            </div>
          )}
          {proximosVencimento.length > 0 && (
            <div 
              className="alert-banner-warning cursor-pointer active:opacity-80 transition-opacity"
              onClick={() => setActiveFilter(activeFilter === 'proximo-vencimento' ? 'todos' : 'proximo-vencimento')}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{proximosVencimento.length} produto{proximosVencimento.length !== 1 ? 's' : ''} vencendo em até 2 dias</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <StatsCard title="Total" value={stats.total} icon={Package} variant="default" description="Produtos cadastrados"
          onClick={() => setActiveFilter(activeFilter === 'todos' ? 'todos' : 'todos')} isActive={activeFilter === 'todos'} />
        <StatsCard title="Válidos" value={stats.validos} icon={CheckCircle} variant="success" description="Em condições ideais"
          onClick={() => setActiveFilter(activeFilter === 'validos' ? 'todos' : 'validos')} isActive={activeFilter === 'validos'} />
        <StatsCard title="Próx. Venc." value={stats.proximoVencimento} icon={Clock} variant="warning" description="Vencendo em até 2 dias"
          onClick={() => setActiveFilter(activeFilter === 'proximo-vencimento' ? 'todos' : 'proximo-vencimento')} isActive={activeFilter === 'proximo-vencimento'} />
        <StatsCard title="Vencidos" value={stats.vencidos} icon={XCircle} variant="danger" description="Ação imediata"
          onClick={() => setActiveFilter(activeFilter === 'vencidos' ? 'todos' : 'vencidos')} isActive={activeFilter === 'vencidos'} />
      </div>

      {/* Charts */}
      <DashboardChart 
        categoryData={stats.porCategoria}
        statusData={{ validos: stats.validos, proximoVencimento: stats.proximoVencimento, vencidos: stats.vencidos }}
      />

      {/* Storage Locations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {storageLocations.map((loc) => (
          <div
            key={loc.name}
            onClick={() => navigate(loc.url)}
            className="group bg-card rounded-xl border border-border/60 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <loc.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{loc.count}</div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{loc.name}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
        <Button size="sm" onClick={() => navigate('/leitor-qrcode')} className="text-xs h-9">
          <QrCode className="w-3.5 h-3.5 mr-1.5" /> Ler QR Code
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/impressao-etiquetas')} className="text-xs h-9">
          <Printer className="w-3.5 h-3.5 mr-1.5" /> Imprimir Etiquetas
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/visualizar-etiquetas')} className="text-xs h-9">
          <Eye className="w-3.5 h-3.5 mr-1.5" /> Visualizar Etiquetas
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/relatorios')} className="text-xs h-9">
          <Package className="w-3.5 h-3.5 mr-1.5" /> Relatórios
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <ProductForm
            onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
            initialData={editingProduct ? {
              nome: editingProduct.nome, lote: editingProduct.lote, marca: editingProduct.marca,
              dataFabricacao: editingProduct.dataFabricacao instanceof Date ? editingProduct.dataFabricacao.toISOString().split('T')[0] : editingProduct.dataFabricacao || '',
              validade: typeof editingProduct.validade === 'string' ? editingProduct.validade : editingProduct.validade instanceof Date ? editingProduct.validade.toISOString().split('T')[0] : '',
              dataAbertura: editingProduct.dataAbertura instanceof Date ? editingProduct.dataAbertura.toISOString().split('T')[0] : editingProduct.dataAbertura || '',
              diasParaVencer: editingProduct.diasParaVencer, localArmazenamento: editingProduct.localArmazenamento,
              responsavel: editingProduct.responsavel, showOptionalDates: editingProduct.showOptionalDates ?? false,
            } : undefined}
            title={editingProduct ? 'Editar Produto' : 'Cadastro de Produto'}
            submitLabel={editingProduct ? 'Atualizar Produto' : 'Salvar Produto'}
          />
        </div>
      )}

      {/* Active filter indicator */}
      {activeFilter !== 'todos' && (
        <div className="alert-banner-info mb-4">
          <span className="text-xs sm:text-sm">Filtrando: <strong>{filterTitles[activeFilter]}</strong></span>
          <Button variant="ghost" size="sm" onClick={() => setActiveFilter('todos')} className="text-xs ml-auto h-7 px-2">
            Limpar
          </Button>
        </div>
      )}

      {/* Product Table */}
      <ProductTable
        products={filteredProducts}
        onEdit={handleEditClick}
        onDelete={handleDeleteProduct}
        onPrintLabel={handlePrintLabel}
        title={filterTitles[activeFilter]}
      />

      <FloatingActionButton
        onNewProduct={() => { setEditingProduct(null); setShowForm(true); }}
        onQuickPrint={() => navigate('/impressao-etiquetas')}
        onReports={() => navigate('/relatorios')}
        onExport={() => toast({ title: "Exportação", description: "Funcionalidade em desenvolvimento..." })}
        onImport={() => toast({ title: "Importação", description: "Funcionalidade em desenvolvimento..." })}
        onSettings={() => toast({ title: "Configurações", description: "Funcionalidade em desenvolvimento..." })}
      />
    </PageLayout>
  );
};

export default Index;
