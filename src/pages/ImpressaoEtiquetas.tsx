
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Printer, Package, Eye, FileText, Settings, Ruler } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { escapeHtml } from "@/lib/security";

const ImpressaoEtiquetas = () => {
  const { products } = useProducts();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Configurações manuais de tamanho (em mm)
  const [largura, setLargura] = useState(() => {
    return parseInt(localStorage.getItem('etiqueta-largura') || '70');
  });
  const [altura, setAltura] = useState(() => {
    return parseInt(localStorage.getItem('etiqueta-altura') || '50');
  });
  
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

  const handleLarguraChange = (value: string) => {
    const novaLargura = parseInt(value) || 50;
    setLargura(novaLargura);
    localStorage.setItem('etiqueta-largura', novaLargura.toString());
  };

  const handleAlturaChange = (value: string) => {
    const novaAltura = parseInt(value) || 30;
    setAltura(novaAltura);
    localStorage.setItem('etiqueta-altura', novaAltura.toString());
  };

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

  // Calcular configurações responsivas baseadas no tamanho
  const getResponsiveConfig = () => {
    const area = largura * altura;
    const aspectRatio = largura / altura;
    
    // Configurações base para diferentes tamanhos
    let fontSize, labelSize, contentSize, padding, spacing;
    
    if (area < 2000) { // Muito pequena (ex: 40x30)
      fontSize = Math.max(8, Math.min(10, area / 250));
      labelSize = fontSize - 1;
      contentSize = fontSize;
      padding = Math.max(4, largura * 0.08);
      spacing = Math.max(2, altura * 0.04);
    } else if (area < 4000) { // Pequena (ex: 50x40, 70x50)
      fontSize = Math.max(10, Math.min(12, area / 300));
      labelSize = fontSize - 1;
      contentSize = fontSize;
      padding = Math.max(6, largura * 0.085);
      spacing = Math.max(3, altura * 0.06);
    } else if (area < 8000) { // Média (ex: 80x70, 100x60)
      fontSize = Math.max(11, Math.min(14, area / 400));
      labelSize = fontSize - 1;
      contentSize = fontSize;
      padding = Math.max(8, largura * 0.09);
      spacing = Math.max(4, altura * 0.08);
    } else { // Grande (ex: 100x80+)
      fontSize = Math.max(12, Math.min(16, area / 500));
      labelSize = fontSize - 1;
      contentSize = fontSize;
      padding = Math.max(10, largura * 0.1);
      spacing = Math.max(5, altura * 0.1);
    }

    return {
      width: `${largura * 3.78}px`, // Conversão mm para px (96 DPI)
      height: `${altura * 3.78}px`,
      fontSize: `${fontSize}px`,
      labelSize: `${labelSize}px`,
      contentSize: `${contentSize}px`,
      padding: `${Math.round(padding)}px`,
      spacing: `${Math.round(spacing)}px`,
      showGrid: aspectRatio > 1.2, // Mostrar grid se for mais largo
      compactMode: area < 2500 // Modo compacto para etiquetas muito pequenas
    };
  };

  const etiquetasPorPagina = 6;
  const totalPaginas = Math.ceil(selectedProducts.length / etiquetasPorPagina);
  const config = getResponsiveConfig();

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

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiquetas Térmicas - ${escapeHtml(selectedProducts.length.toString())} produtos - ${escapeHtml(largura.toString())}x${escapeHtml(altura.toString())}mm</title>
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
                float: left;
                font-size: ${config.fontSize};
                page-break-inside: avoid;
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
              .compact .campo {
                margin-bottom: ${Math.max(2, parseInt(config.spacing) / 2)}px;
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
              `).join('')}
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
      title: "Etiquetas enviadas para impressão",
      description: `${selectedProducts.length} etiqueta(s) ${largura}x${altura}mm enviadas!`,
    });
  };

  const handlePrintSingle = (product: any) => {
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

            {/* Configurações de Tamanho Manual */}
            <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-green-800 to-green-900 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Ruler className="w-5 h-5" />
                  <span>Ajuste Manual de Tamanho</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div>
                    <Label htmlFor="largura" className="text-sm font-medium text-gray-700 mb-2 block">
                      Largura (mm)
                    </Label>
                    <Input
                      id="largura"
                      type="number"
                      min="30"
                      max="150"
                      value={largura}
                      onChange={(e) => handleLarguraChange(e.target.value)}
                      className="text-center"
                    />
                  </div>
                  <div>
                    <Label htmlFor="altura" className="text-sm font-medium text-gray-700 mb-2 block">
                      Altura (mm)
                    </Label>
                    <Input
                      id="altura"
                      type="number"
                      min="20"
                      max="100"
                      value={altura}
                      onChange={(e) => handleAlturaChange(e.target.value)}
                      className="text-center"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-sm text-gray-600 mb-2">Preview:</div>
                    <div 
                      className="border-2 border-gray-400 bg-white flex items-center justify-center text-xs font-bold text-gray-700"
                      style={{
                        width: `${Math.min(80, largura * 0.8)}px`,
                        height: `${Math.min(60, altura * 0.8)}px`
                      }}
                    >
                      {largura}×{altura}mm
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <Settings className="w-4 h-4 inline mr-1" />
                    Layout se adapta automaticamente ao tamanho • Configuração salva automaticamente
                  </p>
                </div>
              </CardContent>
            </Card>

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
                      Imprimir {largura}×{altura}mm ({selectedProducts.length})
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
                      • Tamanho: {largura}×{altura}mm
                      • Layout adaptativo otimizado para impressão térmica
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botões de Impressão Rápida */}
            <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-900 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Printer className="w-5 h-5" />
                  <span>Impressão Rápida - Produtos Cadastrados</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 mb-4">
                  Clique em qualquer produto para imprimir sua etiqueta instantaneamente
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {products.map(product => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-auto p-4 text-left justify-start border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                      onClick={() => handlePrintSingle(product)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <Printer className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {product.nome}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            Lote: {product.lote || 'N/A'} | {product.marca || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.localArmazenamento === 'refrigerado' && '❄️ Refrigerado'}
                            {product.localArmazenamento === 'congelado' && '🧊 Congelado'}
                            {product.localArmazenamento === 'ambiente' && '🌡️ Ambiente'}
                            {product.localArmazenamento === 'camara-fria' && '🏢 Câmara Fria'}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                {products.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum produto cadastrado ainda.</p>
                    <p className="text-sm">Cadastre produtos para usar a impressão rápida.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seleção Multiple Tradicional */}
            <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Checkbox className="mr-2" />
                  <span>Seleção Múltipla - Para Impressão em Lote</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ImpressaoEtiquetas;
