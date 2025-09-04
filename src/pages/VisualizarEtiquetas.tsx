import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
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

  // Separar produtos por status
  const expiredProducts = products.filter(product => isProductExpired(product));
  const validProducts = products.filter(product => !isProductExpired(product));

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-blue-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-8">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    👁️ Visualizar Etiquetas
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">
                    Visualize todas as etiquetas geradas ({products.length} produtos) - Tamanho: {largura}×{altura}mm
                  </p>
                </div>
              </div>
            </div>

            {/* Informação do Tamanho e Controles de Visualização */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-green-700">
                    <Ruler className="w-5 h-5" />
                    <span className="font-medium">
                      Tamanho configurado: {largura}×{altura}mm
                      <span className="text-sm ml-2">(Configure na página de Impressão)</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 font-medium">Modo de Visualização:</span>
                    <div className="flex space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8"
                      >
                        <Grid className="w-4 h-4 mr-1" />
                        Grade
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8"
                      >
                        <List className="w-4 h-4 mr-1" />
                        Lista
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card de Controle */}
            <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>Atualizar Datas "Utilizar até"</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedProducts.length === products.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-gray-600">
                      Selecionar todos ({products.length} produtos)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-64 justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <Button 
                      onClick={handleUpdateUtilizarAte}
                      className="gradient-blue text-white"
                      disabled={selectedProducts.length === 0}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar Datas ({selectedProducts.length})
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Selecione produtos e uma data para definir como nova data de abertura
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Alertas para produtos vencidos */}
            {expiredProducts.length > 0 && (
              <Card className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>⚠️ Produtos Vencidos - Atenção Especial</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-red-800 font-medium">
                    <strong>{expiredProducts.length} produto(s)</strong> estão fora da validade e destacados em vermelho abaixo.
                  </p>
                </CardContent>
              </Card>
            )}

            {!user ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Acesso Restrito
                </h3>
                <p className="text-gray-600 mb-4">
                  Faça login para visualizar suas etiquetas.
                </p>
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="gradient-blue text-white"
                >
                  Fazer Login
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Carregando etiquetas...
                </h3>
                <p className="text-gray-600">
                  Por favor, aguarde enquanto carregamos seus produtos.
                </p>
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-8">
                {/* Produtos Vencidos - Destaque Especial */}
                {expiredProducts.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <h2 className="text-2xl font-bold text-red-700">🚨 Produtos Vencidos ({expiredProducts.length})</h2>
                    </div>
                    <div className={cn(
                      viewMode === 'grid' 
                        ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "space-y-4"
                    )}>
                      {expiredProducts.map((product) => (
                        <div key={product.id} className={cn(
                          "print:break-inside-avoid",
                          viewMode === 'list' && "flex items-center space-x-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg"
                        )}>
                          <div className={cn(
                            "flex items-center space-x-2 print:hidden",
                            viewMode === 'list' ? "flex-shrink-0" : "mb-3"
                          )}>
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() => handleSelectProduct(product.id)}
                            />
                            <span className="text-sm text-red-600 font-bold whitespace-nowrap">⚠️ VENCIDO</span>
                          </div>
                          <div className={cn(
                            "border-4 border-red-500 rounded-lg p-3 bg-red-50 shadow-lg hover:shadow-xl transition-all duration-200",
                            viewMode === 'list' && "flex-1"
                          )}>
                            <EtiquetaView 
                              product={product} 
                              largura={viewMode === 'list' ? 50 : largura} 
                              altura={viewMode === 'list' ? 35 : altura} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Produtos Válidos */}
                {validProducts.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <Eye className="w-6 h-6 text-green-600" />
                      <h2 className="text-2xl font-bold text-green-700">✅ Produtos Válidos ({validProducts.length})</h2>
                    </div>
                    <div className={cn(
                      viewMode === 'grid' 
                        ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "space-y-4"
                    )}>
                      {validProducts.map((product) => (
                        <div key={product.id} className={cn(
                          "print:break-inside-avoid",
                          viewMode === 'list' && "flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        )}>
                          <div className={cn(
                            "flex items-center space-x-2 print:hidden",
                            viewMode === 'list' ? "flex-shrink-0" : "mb-3"
                          )}>
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() => handleSelectProduct(product.id)}
                            />
                            <span className="text-sm text-green-600 whitespace-nowrap">✓ Válido</span>
                          </div>
                          <div className={cn(
                            "hover:shadow-lg transition-shadow duration-200 border border-gray-200 rounded-lg p-3 bg-white",
                            viewMode === 'list' && "flex-1"
                          )}>
                            <EtiquetaView 
                              product={product} 
                              largura={viewMode === 'list' ? 50 : largura} 
                              altura={viewMode === 'list' ? 35 : altura} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma etiqueta encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Cadastre produtos para visualizar as etiquetas aqui.
                </p>
                <Button 
                  onClick={() => window.location.href = '/cadastro'}
                  className="gradient-blue text-white"
                >
                  Cadastrar Produto
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default VisualizarEtiquetas;
