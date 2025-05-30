
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Package, Eye, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ImpressaoEtiquetas = () => {
  const { products } = useProducts();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const navigate = useNavigate();

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

  // Helper function to safely format dates
  const formatDateSafe = (dateValue: any): string => {
    if (!dateValue) return '';
    
    try {
      let date: Date | null = null;
      
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        // Handle string dates in YYYY-MM-DD format
        const [year, month, day] = dateValue.split('-').map(Number);
        if (year && month && day) {
          date = new Date(year, month - 1, day);
        }
      }
      
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
    } catch (error) {
      console.warn('Error formatting date:', dateValue, error);
    }
    
    return '';
  };

  // Calcular número de páginas (considerando 6 etiquetas por página)
  const etiquetasPorPagina = 6;
  const totalPaginas = Math.ceil(selectedProducts.length / etiquetasPorPagina);

  const handlePrint = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    
    if (selectedProductsData.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione pelo menos um produto para imprimir.",
        variant: "destructive",
      });
      return;
    }

    // Criar janela de impressão com layout otimizado
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiquetas - ${selectedProducts.length} produtos</title>
            <style>
              @page {
                size: A4;
                margin: 1cm;
              }
              body { 
                font-family: monospace; 
                margin: 0; 
                padding: 0;
                line-height: 1.2;
              }
              .etiqueta { 
                border: 2px solid #666;
                width: 320px;
                height: 200px;
                margin: 10px;
                padding: 12px;
                float: left;
                font-size: 11px;
                page-break-inside: avoid;
                background: white;
              }
              .campo {
                margin-bottom: 8px;
                border-bottom: 1px solid #ccc;
                padding-bottom: 2px;
                min-height: 16px;
              }
              .label {
                font-weight: bold;
                font-size: 10px;
              }
              .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 8px;
              }
              .checkbox-row {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 8px;
                font-size: 9px;
                margin-bottom: 8px;
              }
              .clearfix::after {
                content: "";
                display: table;
                clear: both;
              }
              @media print {
                .etiqueta {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="clearfix">
              ${selectedProductsData.map(product => `
                <div class="etiqueta">
                  <div class="campo">
                    <div class="label">Nome do Produto:</div>
                    <div>${product.nome || ''}</div>
                  </div>
                  <div class="grid">
                    <div class="campo">
                      <div class="label">Lote nº:</div>
                      <div>${product.lote || ''}</div>
                    </div>
                    <div class="campo">
                      <div class="label">Marca:</div>
                      <div>${product.marca || ''}</div>
                    </div>
                  </div>
                  <div class="grid">
                    <div class="campo">
                      <div class="label">Fab.:</div>
                      <div>${formatDateSafe(product.dataFabricacao)}</div>
                    </div>
                    <div class="campo">
                      <div class="label">Val.:</div>
                      <div>${formatDateSafe(product.validade)}</div>
                    </div>
                  </div>
                  <div class="grid">
                    <div class="campo">
                      <div class="label">DT Abert:</div>
                      <div>${formatDateSafe(product.dataAbertura)}</div>
                    </div>
                    <div class="campo">
                      <div class="label">Utilizar até:</div>
                      <div>${formatDateSafe(product.utilizarAte)}</div>
                    </div>
                  </div>
                  <div class="checkbox-row">
                    <div>${product.localArmazenamento === 'refrigerado' ? '☑' : '☐'} Refrigerado</div>
                    <div>${product.localArmazenamento === 'congelado' ? '☑' : '☐'} Congelado</div>
                    <div>${product.localArmazenamento === 'ambiente' ? '☑' : '☐'} Ambiente</div>
                  </div>
                  <div class="campo">
                    <div class="label">Responsável:</div>
                    <div>${product.responsavel || ''}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Etiquetas enviadas",
      description: `${selectedProducts.length} etiqueta(s) enviada(s) para impressão (${totalPaginas} página${totalPaginas !== 1 ? 's' : ''})!`,
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
                <Printer className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Impressão de Etiquetas
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Selecione os produtos para imprimir etiquetas
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedProducts.length === products.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  Selecionar todos ({products.length} produtos)
                </span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => navigate('/visualizar-etiquetas')}
                  variant="outline"
                  className="text-blue-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar Etiquetas
                </Button>
                <Button 
                  onClick={handlePrint} 
                  disabled={selectedProducts.length === 0}
                  className="gradient-blue text-white"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir ({selectedProducts.length})
                  {selectedProducts.length > 0 && (
                    <span className="ml-1">
                      - {totalPaginas} pág{totalPaginas !== 1 ? 's' : ''}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">
                      {selectedProducts.length} etiqueta{selectedProducts.length !== 1 ? 's' : ''} selecionada{selectedProducts.length !== 1 ? 's' : ''} 
                      • {totalPaginas} página{totalPaginas !== 1 ? 's' : ''} para impressão
                      • {etiquetasPorPagina} etiquetas por página
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                      />
                      <Package className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-sm">{product.nome}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-1">
                      <p><span className="font-medium">Lote:</span> {product.lote}</p>
                      <p><span className="font-medium">Marca:</span> {product.marca}</p>
                      {product.validade && (
                        <p><span className="font-medium">Validade:</span> {formatDateSafe(product.validade)}</p>
                      )}
                      <p><span className="font-medium">Local:</span> {product.localArmazenamento}</p>
                      <p><span className="font-medium">Responsável:</span> {product.responsavel}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ImpressaoEtiquetas;
