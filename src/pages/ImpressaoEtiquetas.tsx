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

  // Check if optional dates should be shown
  const getShowOptionalDates = () => {
    const stored = localStorage.getItem('showOptionalDates');
    return stored ? JSON.parse(stored) : false;
  };

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

  // Helper function to safely format dates with improved display
  const formatDateSafe = (dateValue: any): string => {
    if (!dateValue) return '';
    
    try {
      let date: Date | null = null;
      
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        // Handle different date formats
        if (dateValue.includes('/')) {
          // Handle formats like "DEZEMBRO/2025" or "31/12/2025"
          if (dateValue.match(/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]+\/\d{4}$/)) {
            // Format: DEZEMBRO/2025
            return dateValue;
          } else if (dateValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            // Format: 31/12/2025
            return dateValue;
          } else if (dateValue.match(/^\d{1,2}\/\d{4}$/)) {
            // Format: 12/2025
            return dateValue;
          }
        } else {
          // Handle YYYY-MM-DD format
          const [year, month, day] = dateValue.split('-').map(Number);
          if (year && month && day) {
            date = new Date(year, month - 1, day);
          }
        }
      }
      
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
      
      // Return the original value if it's already formatted
      return dateValue;
    } catch (error) {
      console.warn('Error formatting date:', dateValue, error);
      return '';
    }
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

    // Criar janela de impressão otimizada para impressoras térmicas
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiquetas Térmicas - ${selectedProducts.length} produtos</title>
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
                width: 320px;
                height: 200px;
                margin: 8px;
                padding: 8px;
                float: left;
                font-size: 12px;
                page-break-inside: avoid;
                background: white;
                font-weight: 600;
                color: #000;
              }
              .campo {
                margin-bottom: 6px;
                border-bottom: 2px solid #333;
                padding-bottom: 2px;
                min-height: 18px;
                font-weight: bold;
              }
              .label {
                font-weight: 900;
                font-size: 11px;
                color: #000;
                text-transform: uppercase;
              }
              .content {
                font-weight: 800;
                font-size: 12px;
                color: #000;
                text-transform: uppercase;
                margin-top: 2px;
              }
              .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 6px;
              }
              .checkbox-row {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 6px;
                font-size: 10px;
                margin-bottom: 6px;
                font-weight: 900;
              }
              .checkbox-item {
                display: flex;
                align-items: center;
                font-weight: 900;
                color: #000;
              }
              .checkbox-mark {
                font-size: 14px;
                font-weight: 900;
                margin-right: 2px;
              }
              .clearfix::after {
                content: "";
                display: table;
                clear: both;
              }
              @media print {
                .etiqueta {
                  page-break-inside: avoid;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="clearfix">
              ${selectedProductsData.map(product => `
                <div class="etiqueta">
                  <div class="campo">
                    <div class="label">PRODUTO:</div>
                    <div class="content">${(product.nome || '').toUpperCase()}</div>
                  </div>
                  <div class="grid">
                    <div class="campo">
                      <div class="label">LOTE:</div>
                      <div class="content">${(product.lote || '').toUpperCase()}</div>
                    </div>
                    <div class="campo">
                      <div class="label">MARCA:</div>
                      <div class="content">${(product.marca || '').toUpperCase()}</div>
                    </div>
                  </div>
                  ${product.showOptionalDates ? `
                  <div class="grid">
                    <div class="campo">
                      <div class="label">FABRIC.:</div>
                      <div class="content">${formatDateSafe(product.dataFabricacao)}</div>
                    </div>
                    <div class="campo">
                      <div class="label">VALID.:</div>
                      <div class="content">${formatDateSafe(product.validade)}</div>
                    </div>
                  </div>
                  ` : ''}
                  <div class="grid">
                    <div class="campo">
                      <div class="label">ABERTURA:</div>
                      <div class="content">${formatDateSafe(product.dataAbertura)}</div>
                    </div>
                    <div class="campo">
                      <div class="label">USAR ATÉ:</div>
                      <div class="content">${formatDateSafe(product.utilizarAte)}</div>
                    </div>
                  </div>
                  <div class="checkbox-row">
                    <div class="checkbox-item">
                      <span class="checkbox-mark">${product.localArmazenamento === 'refrigerado' ? '■' : '□'}</span>
                      <span>REFRIG.</span>
                    </div>
                    <div class="checkbox-item">
                      <span class="checkbox-mark">${product.localArmazenamento === 'congelado' ? '■' : '□'}</span>
                      <span>CONGEL.</span>
                    </div>
                    <div class="checkbox-item">
                      <span class="checkbox-mark">${product.localArmazenamento === 'ambiente' ? '■' : '□'}</span>
                      <span>AMBIENT.</span>
                    </div>
                  </div>
                  <div class="campo">
                    <div class="label">RESPONSÁVEL:</div>
                    <div class="content">${(product.responsavel || '').toUpperCase()}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Aguardar carregamento e imprimir
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }

    toast({
      title: "Etiquetas enviadas para impressão",
      description: `${selectedProducts.length} etiqueta(s) otimizada(s) para impressora térmica!`,
    });
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
                  <Printer className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    🖨️ Impressão Térmica
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">
                    Impressão otimizada para impressoras térmicas
                  </p>
                </div>
              </div>
            </div>

            {/* Controles de Impressão */}
            <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Printer className="w-5 h-5" />
                  <span>Controles de Impressão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedProducts.length === products.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      Selecionar todos ({products.length} produtos)
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => navigate('/visualizar-etiquetas')}
                      variant="outline"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar Etiquetas
                    </Button>
                    <Button 
                      onClick={handlePrint} 
                      disabled={selectedProducts.length === 0}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-lg"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir Térmico ({selectedProducts.length})
                      {selectedProducts.length > 0 && (
                        <span className="ml-1">
                          - {totalPaginas} pág{totalPaginas !== 1 ? 's' : ''}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações de Impressão */}
            {selectedProducts.length > 0 && (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">
                      {selectedProducts.length} etiqueta{selectedProducts.length !== 1 ? 's' : ''} 
                      • Otimizada{selectedProducts.length !== 1 ? 's' : ''} para impressão térmica
                      • Fonte monospace para melhor nitidez
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
