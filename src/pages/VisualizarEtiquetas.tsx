
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleUpdateUtilizarAte = () => {
    if (!selectedDate) {
      toast({
        title: "Selecione uma data",
        description: "Escolha uma data no calendário para atualizar as datas 'Utilizar até'.",
        variant: "destructive",
      });
      return;
    }

    let updatedCount = 0;
    products.forEach(product => {
      if (product.dataAbertura && product.diasParaVencer) {
        // Usar a data selecionada como nova data de abertura
        const newUtilizarAte = new Date(selectedDate);
        newUtilizarAte.setDate(newUtilizarAte.getDate() + product.diasParaVencer);
        
        updateProduct(product.id, {
          dataAbertura: selectedDate.toISOString().split('T')[0],
        });
        updatedCount++;
      }
    });

    toast({
      title: "Datas atualizadas",
      description: `${updatedCount} produto(s) tiveram suas datas "Utilizar até" atualizadas.`,
    });
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
                    Visualize todas as etiquetas geradas
                  </p>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Atualizar Datas "Utilizar até"</CardTitle>
              </CardHeader>
              <CardContent>
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
                          setSelectedDate(date);
                          setCalendarOpen(false);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    onClick={handleUpdateUtilizarAte}
                    className="gradient-blue text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar Datas
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Selecione uma data para recalcular as datas "Utilizar até" de todos os produtos
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="print:break-inside-avoid">
                  <EtiquetaView product={product} />
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma etiqueta encontrada
                </h3>
                <p className="text-gray-600">
                  Cadastre produtos para visualizar as etiquetas aqui.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default VisualizarEtiquetas;
