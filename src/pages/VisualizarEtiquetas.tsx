
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EtiquetaView } from "@/components/EtiquetaView";
import { Eye, CalendarIcon, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const VisualizarEtiquetas = () => {
  const { products, updateProduct } = useProducts();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  console.log('Produtos carregados:', products);
  console.log('Total de produtos:', products.length);

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

    // A data selecionada não deve ser no passado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      toast({
        title: "Data inválida",
        description: "A data de abertura não pode ser no passado.",
        variant: "destructive",
      });
      return;
    }

    let updatedCount = 0;
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product && product.diasParaVencer && product.diasParaVencer > 0) {
        // Usar a data selecionada como nova data de abertura
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
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-8">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center space-x-3">
                <Eye className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Visualizar Etiquetas
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Visualize todas as etiquetas geradas ({products.length} produtos)
                  </p>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Atualizar Datas "Utilizar até"</CardTitle>
              </CardHeader>
              <CardContent>
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
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date);
                              setCalendarOpen(false);
                            }
                          }}
                          disabled={(date) => {
                            // Desabilitar datas passadas
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
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
                    Selecione produtos e uma data (hoje ou futura) para definir como nova data de abertura
                  </p>
                </div>
              </CardContent>
            </Card>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="print:break-inside-avoid">
                    <div className="mb-2 flex items-center space-x-2">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                      />
                      <span className="text-sm text-gray-600">Selecionar para atualizar</span>
                    </div>
                    <EtiquetaView product={product} />
                  </div>
                ))}
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
