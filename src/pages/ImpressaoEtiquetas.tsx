
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ImpressaoEtiquetas = () => {
  const { products } = useProducts();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

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

    // Criar conteúdo para impressão
    const printContent = selectedProductsData.map(product => `
      ================================
      ETIQUETA TÉRMICA
      ================================
      Produto: ${product.nome}
      Lote: ${product.lote}
      Marca: ${product.marca}
      Fabricação: ${product.dataFabricacao.toLocaleDateString('pt-BR')}
      Validade: ${product.validade.toLocaleDateString('pt-BR')}
      ${product.dataAbertura ? `Abertura: ${product.dataAbertura.toLocaleDateString('pt-BR')}` : ''}
      ${product.utilizarAte ? `Utilizar até: ${product.utilizarAte.toLocaleDateString('pt-BR')}` : ''}
      Local: ${product.localArmazenamento}
      Responsável: ${product.responsavel}
      ================================
    `).join('\n\n');

    // Simular impressão
    console.log("Imprimindo etiquetas:", printContent);
    
    // Criar janela de impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiquetas</title>
            <style>
              body { font-family: monospace; white-space: pre-line; }
              .etiqueta { page-break-after: always; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            ${selectedProductsData.map(product => `
              <div class="etiqueta">
                ================================<br>
                ETIQUETA TÉRMICA<br>
                ================================<br>
                Produto: ${product.nome}<br>
                Lote: ${product.lote}<br>
                Marca: ${product.marca}<br>
                Fabricação: ${product.dataFabricacao.toLocaleDateString('pt-BR')}<br>
                Validade: ${product.validade.toLocaleDateString('pt-BR')}<br>
                ${product.dataAbertura ? `Abertura: ${product.dataAbertura.toLocaleDateString('pt-BR')}<br>` : ''}
                ${product.utilizarAte ? `Utilizar até: ${product.utilizarAte.toLocaleDateString('pt-BR')}<br>` : ''}
                Local: ${product.localArmazenamento}<br>
                Responsável: ${product.responsavel}<br>
                ================================
              </div>
            `).join('')}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Etiquetas enviadas",
      description: `${selectedProducts.length} etiqueta(s) enviada(s) para impressão!`,
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
              <Button 
                onClick={handlePrint} 
                disabled={selectedProducts.length === 0}
                className="gradient-blue text-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir Selecionados ({selectedProducts.length})
              </Button>
            </div>

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
                      <p><span className="font-medium">Validade:</span> {product.validade.toLocaleDateString('pt-BR')}</p>
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
