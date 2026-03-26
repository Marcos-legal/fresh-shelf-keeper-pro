import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EtiquetaView } from "@/components/EtiquetaView";
import { Eye, CalendarIcon, RefreshCw, AlertTriangle, Ruler, Grid, List } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const VisualizarEtiquetas = () => {
  const { user } = useAuth();
  const { products, updateProduct, loading } = useProductsSupabase();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'valido' | 'proximo-vencimento' | 'vencido'>('all');
  const itemsPerPage = 12;

  // Recuperar tamanhos salvos das etiquetas
  const largura = parseInt(localStorage.getItem('etiqueta-largura') || '70');
  const altura = parseInt(localStorage.getItem('etiqueta-altura') || '50');

  console.log('Produtos carregados:', products);
  console.log('Total de produtos:', products.length);

  // Função para verificar se produto está vencido
  const isProductExpired = (product: any) => {
    const now = new Date();
    let targetDate: Date | undefined;
    
    if (product.utilizarAte instanceof Date) {
      targetDate = product.utilizarAte;
    } else if (product.validade instanceof Date) {
      targetDate = product.validade;
    }
    
    return targetDate && targetDate < now;
  };

  // Filtrar produtos por status
  const filteredProducts = products.filter(product => {
    if (statusFilter === 'all') return true;
    return product.status === statusFilter;
  });

  const expiredProducts = filteredProducts.filter(product => isProductExpired(product));
  const validProducts = filteredProducts.filter(product => !isProductExpired(product));

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const handleUpdateUtilizarAte = () => {
    if (!selectedDate) {
      toast({
        title: "Selecione uma data",
        description: "Escolha uma data no calendário para atualizar as datas 'Utilizar até'.",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Selecione produtos",
        description: "Selecione pelo menos um produto para atualizar.",
        variant: "destructive",
      });
      return;
    }

    let updatedCount = 0;
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) {
        // Usar exatamente a data selecionada como nova data de abertura
        const dataAberturaFormatted = format(selectedDate, 'yyyy-MM-dd');
        
        updateProduct(product.id, {
          dataAbertura: dataAberturaFormatted,
        });
        updatedCount++;
      }
    });

    toast({
      title: "Datas atualizadas",
      description: `${updatedCount} produto(s) tiveram suas datas de abertura e "Utilizar até" atualizadas.`,
    });

    // Limpar seleção após atualização
    setSelectedProducts([]);
  };

  return (
    <PageLayout 
      title="Visualizar Etiquetas" 
      description={`${products.length} produtos · ${largura}×${altura}mm`}
      icon={Eye}
    >

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
              <div className="alert-banner-info">
                <Ruler className="w-4 h-4 flex-shrink-0" />
                <span>Tamanho: {largura}×{altura}mm (configure na Impressão)</span>
              </div>
              <div className="bg-card rounded-xl border border-border/60 p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Visualização:</span>
                <div className="flex gap-1.5">
                  <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className="h-7 text-xs">
                    <Grid className="w-3.5 h-3.5 mr-1" />Grade
                  </Button>
                  <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')} className="h-7 text-xs">
                    <List className="w-3.5 h-3.5 mr-1" />Lista
                  </Button>
                </div>
              </div>
            </div>

            {/* Update Dates Card */}
            <div className="bg-card rounded-xl border border-border/60 mb-6">
              <div className="p-4 sm:p-5 border-b border-border/40">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  Atualizar Datas "Utilizar até"
                </h3>
              </div>
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox checked={selectedProducts.length === products.length} onCheckedChange={handleSelectAll} />
                  <span className="text-sm text-muted-foreground">Selecionar todos ({products.length})</span>
                </div>
                <div className="flex items-center gap-3">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className={cn("w-52 justify-start text-left text-sm", !selectedDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <Button onClick={handleUpdateUtilizarAte} size="sm" disabled={selectedProducts.length === 0}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Atualizar ({selectedProducts.length})
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Selecione produtos e uma data para definir como nova data de abertura</p>
              </div>
            </div>

            {/* Alertas para produtos vencidos */}
            {expiredProducts.length > 0 && (
              <div className="alert-banner-danger mb-6">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span><strong>{expiredProducts.length} produto(s)</strong> fora da validade — destacados em vermelho abaixo</span>
              </div>
            )}

            {!user ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" />
                <h3 className="text-base font-medium text-foreground mb-1">Acesso Restrito</h3>
                <p className="text-sm text-muted-foreground mb-4">Faça login para visualizar suas etiquetas.</p>
                <Button onClick={() => window.location.href = '/auth'} size="sm">Fazer Login</Button>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-primary mx-auto mb-3 animate-spin" />
                <h3 className="text-base font-medium text-foreground mb-1">Carregando etiquetas...</h3>
                <p className="text-sm text-muted-foreground">Aguarde enquanto carregamos seus produtos.</p>
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-8">
                {/* Produtos Vencidos - Destaque Especial */}
                {expiredProducts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <h2 className="text-sm font-semibold text-destructive">Produtos Vencidos ({expiredProducts.length})</h2>
                    </div>
                    <div className={cn(
                      viewMode === 'grid' 
                        ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "space-y-3"
                    )}>
                      {expiredProducts.map((product) => (
                        <div key={product.id} className={cn(
                          "print:break-inside-avoid",
                          viewMode === 'list' && "flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/15 rounded-xl"
                        )}>
                          <div className={cn(
                            "flex items-center gap-2 print:hidden",
                            viewMode === 'list' ? "flex-shrink-0" : "mb-2"
                          )}>
                            <Checkbox checked={selectedProducts.includes(product.id)} onCheckedChange={() => handleSelectProduct(product.id)} />
                            <span className="text-[11px] text-destructive font-semibold">VENCIDO</span>
                          </div>
                          <div className={cn(
                            "border border-destructive/20 rounded-xl p-3 bg-destructive/5 hover:shadow-sm transition-all duration-200",
                            viewMode === 'list' && "flex-1"
                          )}>
                            <EtiquetaView product={product} largura={viewMode === 'list' ? 90 : largura} altura={viewMode === 'list' ? 60 : altura} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Produtos Válidos */}
                {validProducts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-4 h-4 text-success" />
                      <h2 className="text-sm font-semibold text-success">Produtos Válidos ({validProducts.length})</h2>
                    </div>
                    <div className={cn(
                      viewMode === 'grid' 
                        ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "space-y-3"
                    )}>
                      {validProducts.map((product) => (
                        <div key={product.id} className={cn(
                          "print:break-inside-avoid",
                          viewMode === 'list' && "flex items-center gap-3 p-3 bg-card border border-border/60 rounded-xl hover:shadow-sm transition-shadow"
                        )}>
                          <div className={cn(
                            "flex items-center gap-2 print:hidden",
                            viewMode === 'list' ? "flex-shrink-0" : "mb-2"
                          )}>
                            <Checkbox checked={selectedProducts.includes(product.id)} onCheckedChange={() => handleSelectProduct(product.id)} />
                            <span className="text-[11px] text-success font-medium">Válido</span>
                          </div>
                          <div className={cn(
                            "hover:shadow-sm transition-shadow duration-200 border border-border/60 rounded-xl p-3 bg-card",
                            viewMode === 'list' && "flex-1"
                          )}>
                            <EtiquetaView product={product} largura={viewMode === 'list' ? 50 : largura} altura={viewMode === 'list' ? 35 : altura} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-base font-medium text-foreground mb-1">Nenhuma etiqueta encontrada</h3>
                <p className="text-sm text-muted-foreground mb-4">Cadastre produtos para visualizar as etiquetas aqui.</p>
                <Button onClick={() => window.location.href = '/cadastro'} size="sm">Cadastrar Produto</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default VisualizarEtiquetas;
