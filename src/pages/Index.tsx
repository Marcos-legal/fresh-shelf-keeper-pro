
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Product, ProductFormData } from "@/types/product";
import { ProductTable } from "@/components/ProductTable";
import { ProductForm } from "@/components/ProductForm";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Plus, Package, CheckCircle, AlertTriangle, XCircle, Thermometer, Snowflake, Home, Refrigerator, TrendingUp, Clock, Users, Printer, Eye, FileText } from "lucide-react";
import { QuickActionBar } from "@/components/QuickActionBar";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardChart } from "@/components/DashboardChart";
import { Skeleton } from "@/components/ui/skeleton";
import { escapeHtml } from "@/lib/security";

const Index = () => {
  const navigate = useNavigate();
  const { products, loading, addProduct, updateProduct, deleteProduct, stats, getProductsByCategory } = useProductsSupabase();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'validos' | 'proximo-vencimento' | 'vencidos'>('todos');

  console.log('Produtos carregados no Index:', products);

  const handleAddProduct = (data: ProductFormData) => {
    console.log('Adicionando produto no Index:', data);
    addProduct(data);
    setShowForm(false);
    toast({
      title: "Produto cadastrado",
      description: "Produto foi cadastrado com sucesso!",
    });
  };

  const handleEditProduct = (data: ProductFormData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      setEditingProduct(null);
      setShowForm(false);
      toast({
        title: "Produto atualizado",
        description: "Produto foi atualizado com sucesso!",
      });
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast({
      title: "Produto excluído",
      description: "Produto foi excluído com sucesso!",
      variant: "destructive",
    });
  };

  const handleEditClick = (product: Product) => {
    // Converter datas para formato string apropriado para o formulário
    const formattedProduct = {
      ...product,
      dataFabricacao: product.dataFabricacao instanceof Date 
        ? product.dataFabricacao.toISOString().split('T')[0] 
        : product.dataFabricacao || '',
      validade: typeof product.validade === 'string' 
        ? product.validade 
        : product.validade instanceof Date 
          ? product.validade.toISOString().split('T')[0] 
          : '',
      dataAbertura: product.dataAbertura instanceof Date 
        ? product.dataAbertura.toISOString().split('T')[0] 
        : product.dataAbertura || '',
    };
    
    setEditingProduct(product);
    setShowForm(true);
  };

  const handlePrintLabel = (product: Product) => {
    // Configurações padrão para impressão rápida
    const largura = parseInt(localStorage.getItem('etiqueta-largura') || '70');
    const altura = parseInt(localStorage.getItem('etiqueta-altura') || '50');
    
    const formatDateSafe = (dateValue: any): string => {
      if (!dateValue) return '';
      
      try {
        let date: Date | null = null;
        
        if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'string') {
          if (dateValue.includes('/')) {
            if (dateValue.match(/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]+\/\d{4}$/)) {
              return dateValue;
            } else if (dateValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
              return dateValue;
            } else if (dateValue.match(/^\d{1,2}\/\d{4}$/)) {
              return dateValue;
            }
          } else {
            const [year, month, day] = dateValue.split('-').map(Number);
            if (year && month && day) {
              date = new Date(year, month - 1, day);
            }
          }
        }
        
        if (date && !isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR');
        }
        
        return dateValue;
      } catch (error) {
        console.warn('Error formatting date:', dateValue, error);
        return '';
      }
    };

    const getResponsiveConfig = () => {
      const area = largura * altura;
      let fontSize, labelSize, contentSize, padding, spacing;
      
      if (area < 2000) {
        fontSize = Math.max(8, Math.min(10, area / 250));
        labelSize = fontSize - 1;
        contentSize = fontSize;
        padding = Math.max(4, largura * 0.08);
        spacing = Math.max(2, altura * 0.04);
      } else if (area < 4000) {
        fontSize = Math.max(10, Math.min(12, area / 300));
        labelSize = fontSize - 1;
        contentSize = fontSize;
        padding = Math.max(6, largura * 0.085);
        spacing = Math.max(3, altura * 0.06);
      } else if (area < 8000) {
        fontSize = Math.max(11, Math.min(14, area / 400));
        labelSize = fontSize - 1;
        contentSize = fontSize;
        padding = Math.max(8, largura * 0.09);
        spacing = Math.max(4, altura * 0.08);
      } else {
        fontSize = Math.max(12, Math.min(16, area / 500));
        labelSize = fontSize - 1;
        contentSize = fontSize;
        padding = Math.max(10, largura * 0.1);
        spacing = Math.max(5, altura * 0.1);
      }

      return {
        width: `${largura * 3.78}px`,
        height: `${altura * 3.78}px`,
        fontSize: `${fontSize}px`,
        labelSize: `${labelSize}px`,
        contentSize: `${contentSize}px`,
        padding: `${Math.round(padding)}px`,
        spacing: `${Math.round(spacing)}px`,
        showGrid: (largura / altura) > 1.2,
        compactMode: area < 2500
      };
    };

    const config = getResponsiveConfig();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiqueta - ${escapeHtml(product.nome || '')} - ${escapeHtml(largura.toString())}x${escapeHtml(altura.toString())}mm</title>
            <style>
              @page {
                size: A4;
                margin: 0.5cm;
              }
              body { 
                font-family: 'Courier New', 'Liberation Mono', monospace; 
                margin: 0; 
                padding: 0;
                line-height: 1.1;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .etiqueta { 
                border: 3px solid #000;
                width: ${config.width};
                height: ${config.height};
                margin: 8px;
                padding: ${config.padding};
                font-size: ${config.fontSize};
                background: white;
                font-weight: 600;
                color: #000;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: hidden;
              }
              .campo {
                margin-bottom: ${config.spacing};
                border-bottom: 2px solid #333;
                padding-bottom: 2px;
                min-height: ${config.compactMode ? '12px' : '16px'};
                font-weight: bold;
                flex-shrink: 0;
                overflow: hidden;
              }
              .label {
                font-weight: 900;
                font-size: ${config.labelSize};
                color: #000;
                text-transform: uppercase;
                line-height: 1;
              }
              .content {
                font-weight: 800;
                font-size: ${config.contentSize};
                color: #000;
                text-transform: uppercase;
                margin-top: 2px;
                word-wrap: break-word;
                overflow: hidden;
                line-height: 1.1;
                max-height: ${config.compactMode ? '24px' : '32px'};
              }
              .grid {
                display: ${config.showGrid ? 'grid' : 'block'};
                grid-template-columns: ${config.showGrid ? '1fr 1fr' : '1fr'};
                gap: ${config.showGrid ? '4px' : '0'};
                margin-bottom: ${config.spacing};
              }
              .checkbox-row {
                display: ${config.compactMode ? 'flex' : 'grid'};
                ${config.compactMode ? 'justify-content: space-between' : 'grid-template-columns: 1fr 1fr 1fr'};
                gap: ${config.compactMode ? '2px' : '4px'};
                font-size: ${config.labelSize};
                margin-bottom: ${config.spacing};
                font-weight: 900;
                flex-wrap: wrap;
              }
              .checkbox-item {
                display: flex;
                align-items: center;
                font-weight: 900;
                color: #000;
                ${config.compactMode ? 'font-size: ' + (parseInt(config.labelSize) - 1) + 'px' : ''};
              }
              .checkbox-mark {
                font-size: ${config.compactMode ? '10px' : '12px'};
                font-weight: 900;
                margin-right: 2px;
              }
            </style>
          </head>
          <body>
            <div class="etiqueta ${config.compactMode ? 'compact' : ''}">
              <div class="campo">
                <div class="label">PRODUTO:</div>
                <div class="content">${escapeHtml((product.nome || '').toUpperCase())}</div>
              </div>
              <div class="grid">
                <div class="campo">
                  <div class="label">LOTE:</div>
                  <div class="content">${escapeHtml((product.lote || '').toUpperCase())}</div>
                </div>
                ${config.showGrid ? `
                <div class="campo">
                  <div class="label">MARCA:</div>
                  <div class="content">${escapeHtml((product.marca || '').toUpperCase())}</div>
                </div>
                ` : ''}
              </div>
              ${!config.showGrid ? `
              <div class="campo">
                <div class="label">MARCA:</div>
                <div class="content">${escapeHtml((product.marca || '').toUpperCase())}</div>
              </div>
              ` : ''}
              ${product.showOptionalDates && !config.compactMode ? `
              <div class="grid">
                <div class="campo">
                  <div class="label">FABRIC.:</div>
                  <div class="content">${escapeHtml(formatDateSafe(product.dataFabricacao))}</div>
                </div>
                <div class="campo">
                  <div class="label">VALID.:</div>
                  <div class="content">${escapeHtml(formatDateSafe(product.validade))}</div>
                </div>
              </div>
              ` : ''}
              <div class="grid">
                <div class="campo">
                  <div class="label">ABERTURA:</div>
                  <div class="content">${escapeHtml(formatDateSafe(product.dataAbertura))}</div>
                </div>
                ${config.showGrid ? `
                <div class="campo">
                  <div class="label">USAR ATÉ:</div>
                  <div class="content">${escapeHtml(formatDateSafe(product.utilizarAte))}</div>
                </div>
                ` : ''}
              </div>
              ${!config.showGrid ? `
              <div class="campo">
                <div class="label">USAR ATÉ:</div>
                <div class="content">${escapeHtml(formatDateSafe(product.utilizarAte))}</div>
              </div>
              ` : ''}
              <div class="checkbox-row">
                <div class="checkbox-item">
                  <span class="checkbox-mark">${product.localArmazenamento === 'refrigerado' ? '■' : '□'}</span>
                  <span>REF</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox-mark">${product.localArmazenamento === 'congelado' ? '■' : '□'}</span>
                  <span>CON</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox-mark">${product.localArmazenamento === 'ambiente' ? '■' : '□'}</span>
                  <span>AMB</span>
                </div>
              </div>
              ${!config.compactMode ? `
              <div class="campo">
                <div class="label">RESPONSÁVEL:</div>
                <div class="content">${escapeHtml((product.responsavel || '').toUpperCase())}</div>
              </div>
              ` : ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }

    toast({
      title: "Etiqueta enviada para impressão",
      description: `Etiqueta de ${product.nome} ${largura}x${altura}mm enviada!`,
    });
  };

  // Produtos próximos do vencimento (2 dias)
  const proximosVencimento = products.filter(product => {
    const now = new Date();
    let targetDate: Date | undefined;
    
    if (product.utilizarAte instanceof Date) {
      targetDate = product.utilizarAte;
    } else if (product.validade instanceof Date) {
      targetDate = product.validade;
    }
    
    if (!targetDate) return false;
    
    const daysToExpire = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysToExpire <= 2 && daysToExpire > 0;
  });

  // Produtos vencidos
  const produtosVencidos = products.filter(product => product.status === 'vencido');

  // Filtered products based on active filter
  const filteredProducts = (() => {
    switch (activeFilter) {
      case 'validos':
        return products.filter(p => p.status === 'valido');
      case 'proximo-vencimento':
        return proximosVencimento;
      case 'vencidos':
        return produtosVencidos;
      default:
        return products;
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
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="lg:hidden" />
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MobileDrawer />
        <AppSidebar />
        <main className="flex-1 w-full">
          <div className="p-3 sm:p-4 md:p-6 pt-14 sm:pt-4">
            {/* Breadcrumbs */}
            <div className="mb-4 sm:mb-6">
              <Breadcrumbs />
            </div>

            {/* Header Moderno */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 lg:mb-8 space-y-3 sm:space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <SidebarTrigger className="hover:bg-muted rounded-lg transition-colors p-2 hidden lg:flex" />
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 gradient-blue rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Dashboard Inteligente
                    </h1>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-0.5 sm:mt-1 flex items-center space-x-1 sm:space-x-2">
                      <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                      <span className="hidden sm:block">Controle total de validades em tempo real</span>
                      <span className="sm:hidden">Controle de validades</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <ThemeToggle />
                <Button 
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(!showForm);
                  }} 
                  className="gradient-blue text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm lg:text-base"
                  size={window.innerWidth < 768 ? "default" : "lg"}
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                  <span className="hidden sm:block">{showForm ? 'Cancelar' : 'Novo Produto'}</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </div>
            </div>

            {/* Gráficos Interativos */}
            <DashboardChart 
              categoryData={stats.porCategoria}
              statusData={{
                validos: stats.validos,
                proximoVencimento: stats.proximoVencimento,
                vencidos: stats.vencidos
              }}
            />

            {/* Barra de Ações Rápidas */}
            <QuickActionBar
              onNewProduct={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              totalProducts={stats.total}
              expiredCount={stats.vencidos}
              expiringCount={stats.proximoVencimento}
              onRefresh={() => window.location.reload()}
              onExport={() => toast({
                title: "Exportação",
                description: "Funcionalidade em desenvolvimento...",
              })}
              onImport={() => toast({
                title: "Importação",
                description: "Funcionalidade em desenvolvimento...",
              })}
            />

            {/* Cards de Estatísticas Principais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <StatsCard
                title="Total de Produtos"
                value={stats.total}
                icon={Package}
                variant="default"
                description="Produtos cadastrados"
                onClick={() => setActiveFilter(activeFilter === 'todos' ? 'todos' : 'todos')}
                actionIcon={Eye}
                actionLabel="Ver"
              />
              <StatsCard
                title="Produtos Válidos"
                value={stats.validos}
                icon={CheckCircle}
                variant="success"
                description="Em condições ideais"
                onClick={() => setActiveFilter(activeFilter === 'validos' ? 'todos' : 'validos')}
                actionIcon={FileText}
                actionLabel="Relatório"
              />
              <StatsCard
                title="Próx. Vencimento"
                value={stats.proximoVencimento}
                icon={AlertTriangle}
                variant="warning"
                description="Atenção necessária"
                onClick={() => setActiveFilter(activeFilter === 'proximo-vencimento' ? 'todos' : 'proximo-vencimento')}
                actionIcon={Clock}
                actionLabel="Ver Lista"
              />
              <StatsCard
                title="Produtos Vencidos"
                value={stats.vencidos}
                icon={XCircle}
                variant="danger"
                description="Requer ação imediata"
                onClick={() => setActiveFilter(activeFilter === 'vencidos' ? 'todos' : 'vencidos')}
                actionIcon={AlertTriangle}
                actionLabel="Urgente"
              />
            </div>

            {/* Cards de Locais de Armazenamento - Clicáveis */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20"
                onClick={() => navigate('/refrigerado')}
              >
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                  <CardTitle className="flex items-center justify-between text-primary">
                    <span className="text-sm sm:text-lg font-semibold truncate">Refrigerado</span>
                    <Thermometer className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">
                    {stats.porCategoria.refrigerado}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">produtos refrigerados</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-secondary/10 to-secondary/20 border-secondary/20"
                onClick={() => navigate('/congelado')}
              >
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                  <CardTitle className="flex items-center justify-between text-secondary">
                    <span className="text-sm sm:text-lg font-semibold truncate">Congelado</span>
                    <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">
                    {stats.porCategoria.congelado}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">produtos congelados</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-accent/10 to-accent/20 border-accent/20"
                onClick={() => navigate('/ambiente')}
              >
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                  <CardTitle className="flex items-center justify-between text-accent-foreground">
                    <span className="text-sm sm:text-lg font-semibold truncate">Ambiente</span>
                    <Home className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">
                    {stats.porCategoria.ambiente}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">temperatura ambiente</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-muted/30 to-muted/50 border-muted"
                onClick={() => navigate('/camara-fria')}
              >
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                  <CardTitle className="flex items-center justify-between text-muted-foreground">
                    <span className="text-sm sm:text-lg font-semibold truncate">Câmara Fria</span>
                    <Refrigerator className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">
                    {stats.porCategoria['camara-fria']}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">câmara refrigerada</p>
                </CardContent>
              </Card>
            </div>

            {/* Alertas Inteligentes */}
            {(proximosVencimento.length > 0 || produtosVencidos.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
                {proximosVencimento.length > 0 && (
                  <Card className="border-warning/50 bg-gradient-to-br from-warning/10 to-warning/20 animate-fade-in">
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="flex items-center space-x-2 text-warning text-sm sm:text-base">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Atenção Requerida</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                      <p className="text-warning text-xs sm:text-sm mb-3 sm:mb-4">
                        {proximosVencimento.length} produto(s) vencendo em breve
                      </p>
                      <div className="space-y-2">
                        {proximosVencimento.slice(0, 3).map(product => (
                          <div key={product.id} className="flex justify-between items-center p-2 bg-background rounded-lg shadow-sm">
                            <span className="font-medium text-foreground text-xs sm:text-sm truncate flex-1 mr-2">{product.nome}</span>
                            <span className="text-xs text-warning flex-shrink-0">{product.lote}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {produtosVencidos.length > 0 && (
                  <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-400 text-sm sm:text-base">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Ação Urgente</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                      <p className="text-red-700 dark:text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">
                        {produtosVencidos.length} produto(s) vencidos
                      </p>
                      <div className="space-y-2">
                        {produtosVencidos.slice(0, 3).map(product => (
                          <div key={product.id} className="flex justify-between items-center p-2 bg-background rounded-lg">
                            <span className="font-medium text-foreground text-xs sm:text-sm truncate flex-1 mr-2">{product.nome}</span>
                            <span className="text-xs text-red-600 dark:text-red-400 flex-shrink-0">{product.lote}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Formulário */}
            {showForm && (
              <div className="mb-8">
                <ProductForm
                  onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
                  initialData={editingProduct ? {
                    nome: editingProduct.nome,
                    lote: editingProduct.lote,
                    marca: editingProduct.marca,
                    dataFabricacao: editingProduct.dataFabricacao instanceof Date 
                      ? editingProduct.dataFabricacao.toISOString().split('T')[0] 
                      : editingProduct.dataFabricacao || '',
                    validade: typeof editingProduct.validade === 'string' 
                      ? editingProduct.validade 
                      : editingProduct.validade instanceof Date 
                        ? editingProduct.validade.toISOString().split('T')[0] 
                        : '',
                    dataAbertura: editingProduct.dataAbertura instanceof Date 
                      ? editingProduct.dataAbertura.toISOString().split('T')[0] 
                      : editingProduct.dataAbertura || '',
                    diasParaVencer: editingProduct.diasParaVencer,
                    localArmazenamento: editingProduct.localArmazenamento,
                    responsavel: editingProduct.responsavel,
                    showOptionalDates: editingProduct.showOptionalDates ?? false,
                  } : undefined}
                  title={editingProduct ? 'Editar Produto' : 'Cadastro de Produto'}
                  submitLabel={editingProduct ? 'Atualizar Produto' : 'Salvar Produto'}
                />
              </div>
            )}

            {/* Tabela de produtos */}
            <ProductTable
              products={products}
              onEdit={handleEditClick}
              onDelete={handleDeleteProduct}
              onPrintLabel={handlePrintLabel}
              title="Todos os Produtos"
            />
          </div>
        </main>

        {/* Floating Action Button */}
        <FloatingActionButton
          onNewProduct={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          onQuickPrint={() => navigate('/impressao-etiquetas')}
          onReports={() => navigate('/relatorios')}
          onExport={() => toast({
            title: "Exportação",
            description: "Funcionalidade em desenvolvimento...",
          })}
          onImport={() => toast({
            title: "Importação", 
            description: "Funcionalidade em desenvolvimento...",
          })}
          onSettings={() => toast({
            title: "Configurações",
            description: "Funcionalidade em desenvolvimento...",
          })}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
