
import { useState, useRef, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, Package, Eye, FileText, Settings, Ruler, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { escapeHtml } from "@/lib/security";
import { ResponsavelSelectField } from "@/components/form/ResponsavelSelectField";
import { EtiquetaEditor } from "@/components/EtiquetaEditor";
import { Product } from "@/types/product";

const ImpressaoEtiquetas = () => {
  const { products } = useProductsSupabase();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [quickPrintQuantities, setQuickPrintQuantities] = useState<Record<string, number>>({});
  
  // Configurações manuais de tamanho (em mm)
  const [largura, setLargura] = useState(() => {
    return parseInt(localStorage.getItem('etiqueta-largura') || '70');
  });
  const [altura, setAltura] = useState(() => {
    return parseInt(localStorage.getItem('etiqueta-altura') || '50');
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [responsavel, setResponsavel] = useState('');
  const [showResponsavelDialog, setShowResponsavelDialog] = useState(false);
  const [printAction, setPrintAction] = useState<'batch' | 'single' | null>(null);
  const [singleProductToPrint, setSingleProductToPrint] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  
  // Scroll to editor when it opens
  useEffect(() => {
    if (showEditor && editorRef.current) {
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showEditor]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newSelected = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      // Initialize quantity to 1 if selecting
      if (!prev.includes(productId)) {
        setProductQuantities(prevQty => ({
          ...prevQty,
          [productId]: prevQty[productId] || 1
        }));
      }
      
      return newSelected;
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(99, quantity))
    }));
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
    
    // Configurações base para diferentes tamanhos - AJUSTE MELHORADO
    let fontSize, labelSize, contentSize, padding, spacing;
    
    if (area < 2000) { // Muito pequena (ex: 40x30)
      fontSize = Math.max(7, Math.min(9, area / 280));
      labelSize = Math.max(6, fontSize - 1);
      contentSize = fontSize;
      padding = Math.max(3, largura * 0.06);
      spacing = Math.max(1.5, altura * 0.03);
    } else if (area < 4000) { // Pequena (ex: 50x40, 70x50)
      fontSize = Math.max(9, Math.min(11, area / 350));
      labelSize = Math.max(7, fontSize - 1);
      contentSize = fontSize;
      padding = Math.max(5, largura * 0.07);
      spacing = Math.max(2.5, altura * 0.05);
    } else if (area < 8000) { // Média (ex: 80x70, 100x60)
      fontSize = Math.max(10, Math.min(13, area / 450));
      labelSize = Math.max(8, fontSize - 1);
      contentSize = fontSize;
      padding = Math.max(7, largura * 0.08);
      spacing = Math.max(3.5, altura * 0.07);
    } else { // Grande (ex: 100x80+)
      fontSize = Math.max(11, Math.min(15, area / 550));
      labelSize = Math.max(9, fontSize - 1);
      contentSize = fontSize;
      padding = Math.max(9, largura * 0.09);
      spacing = Math.max(4.5, altura * 0.09);
    }

    return {
      width: `${largura * 3.78}px`, // Conversão mm para px (96 DPI)
      height: `${altura * 3.78}px`,
      fontSize: `${fontSize.toFixed(1)}px`,
      labelSize: `${labelSize.toFixed(1)}px`,
      contentSize: `${contentSize.toFixed(1)}px`,
      padding: `${Math.round(padding)}px`,
      spacing: `${Math.round(spacing)}px`,
      showGrid: aspectRatio > 1.2, // Mostrar grid se for mais largo
      compactMode: area < 2500 // Modo compacto para etiquetas muito pequenas
    };
  };

  const etiquetasPorPagina = 6;
  const totalPaginas = Math.ceil(selectedProducts.length / etiquetasPorPagina);
  const config = getResponsiveConfig();

  const handlePrintRequest = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    
    if (selectedProductsData.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione pelo menos um produto para imprimir.",
        variant: "destructive",
      });
      return;
    }

    setPrintAction('batch');
    setShowResponsavelDialog(true);
  };

  const handlePrintSingleRequest = (product: any, quantity: number = 1) => {
    setSingleProductToPrint({ ...product, quickPrintQuantity: quantity });
    setPrintAction('single');
    setShowResponsavelDialog(true);
  };

  const handleQuickPrintQuantityChange = (productId: string, quantity: number) => {
    setQuickPrintQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(99, quantity))
    }));
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product as Product);
    setShowEditor(true);
  };

  const handleEditorPrint = (editedProduct: Product, editedResponsavel: string, quantity: number) => {
    const expandedProducts = Array(quantity).fill(editedProduct);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiquetas - ${escapeHtml(editedProduct.nome || '')} (${quantity}x) - ${escapeHtml(largura.toString())}x${escapeHtml(altura.toString())}mm</title>
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
                margin-bottom: ${Math.max(2, parseInt(config.spacing) * 0.4)}px;
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
              }
            </style>
          </head>
          <body>
            <div class="clearfix">
              ${expandedProducts.map(prod => `
                <div class="etiqueta ${config.compactMode ? 'compact' : ''}">
                  <div class="campo">
                    <div class="label">PRODUTO:</div>
                    <div class="content">${escapeHtml((prod.nome || '').toUpperCase())}</div>
                  </div>
                  <div class="grid">
                    <div class="campo">
                      <div class="label">LOTE:</div>
                      <div class="content">${escapeHtml((prod.lote || '').toUpperCase())}</div>
                    </div>
                    ${config.showGrid ? `
                    <div class="campo">
                      <div class="label">MARCA:</div>
                      <div class="content">${escapeHtml((prod.marca || '').toUpperCase())}</div>
                    </div>
                    ` : ''}
                  </div>
                  ${!config.showGrid ? `
                  <div class="campo">
                    <div class="label">MARCA:</div>
                    <div class="content">${escapeHtml((prod.marca || '').toUpperCase())}</div>
                  </div>
                  ` : ''}
                  ${prod.dataFabricacao || prod.validade ? `
                  <div class="grid">
                    ${prod.dataFabricacao ? `
                    <div class="campo">
                      <div class="label">FABRIC.:</div>
                      <div class="content">${escapeHtml(formatDateSafe(prod.dataFabricacao))}</div>
                    </div>
                    ` : ''}
                    ${prod.validade && config.showGrid ? `
                    <div class="campo">
                      <div class="label">VALID.:</div>
                      <div class="content">${escapeHtml(formatDateSafe(prod.validade))}</div>
                    </div>
                    ` : ''}
                  </div>
                  ${prod.validade && !config.showGrid ? `
                  <div class="campo">
                    <div class="label">VALID.:</div>
                    <div class="content">${escapeHtml(formatDateSafe(prod.validade))}</div>
                  </div>
                  ` : ''}
                  ` : ''}
                  <div class="grid">
                    <div class="campo">
                      <div class="label">ABERTURA:</div>
                      <div class="content">${escapeHtml(formatDateSafe(prod.dataAbertura))}</div>
                    </div>
                    ${config.showGrid ? `
                    <div class="campo">
                      <div class="label">USAR ATÉ:</div>
                      <div class="content">${escapeHtml(formatDateSafe(prod.utilizarAte))}</div>
                    </div>
                    ` : ''}
                  </div>
                  ${!config.showGrid ? `
                  <div class="campo">
                    <div class="label">USAR ATÉ:</div>
                    <div class="content">${escapeHtml(formatDateSafe(prod.utilizarAte))}</div>
                  </div>
                  ` : ''}
                  <div class="checkbox-row">
                    <div class="checkbox-item">
                      <span class="checkbox-mark">${prod.localArmazenamento === 'refrigerado' ? '■' : '□'}</span>
                      <span>REF</span>
                    </div>
                    <div class="checkbox-item">
                      <span class="checkbox-mark">${prod.localArmazenamento === 'congelado' ? '■' : '□'}</span>
                      <span>CON</span>
                    </div>
                    <div class="checkbox-item">
                      <span class="checkbox-mark">${prod.localArmazenamento === 'ambiente' ? '■' : '□'}</span>
                      <span>AMB</span>
                    </div>
                  </div>
                  ${!config.compactMode ? `
                  <div class="campo">
                    <div class="label">RESPONSÁVEL:</div>
                    <div class="content">${escapeHtml(editedResponsavel.toUpperCase())}</div>
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
      description: `${quantity} etiqueta(s) de ${editedProduct.nome} (${largura}x${altura}mm) enviadas!`,
    });

    setShowEditor(false);
    setEditingProduct(null);
  };

  const executePrint = () => {
    if (!responsavel.trim()) {
      toast({
        title: "Responsável obrigatório",
        description: "Por favor, selecione um responsável antes de imprimir.",
        variant: "destructive",
      });
      return;
    }

    if (printAction === 'batch') {
      handlePrint();
    } else if (printAction === 'single' && singleProductToPrint) {
      handlePrintSingle(singleProductToPrint);
    }

    setShowResponsavelDialog(false);
    setResponsavel('');
    setPrintAction(null);
    setSingleProductToPrint(null);
  };

  const handlePrint = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

    // Expandir produtos baseado nas quantidades
    const expandedProducts = selectedProductsData.flatMap(product => {
      const quantity = productQuantities[product.id] || 1;
      return Array(quantity).fill(product);
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const totalLabels = expandedProducts.length;
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiquetas Térmicas - ${escapeHtml(totalLabels.toString())} etiquetas - ${escapeHtml(largura.toString())}x${escapeHtml(altura.toString())}mm</title>
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
                margin-bottom: ${Math.max(2, parseInt(config.spacing) * 0.4)}px;
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
              ${expandedProducts.map(product => `
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
                  ${product.dataFabricacao || product.validade ? `
                  <div class="grid">
                    ${product.dataFabricacao ? `
                    <div class="campo">
                      <div class="label">FABRIC.:</div>
                      <div class="content">${escapeHtml(formatDateSafe(product.dataFabricacao))}</div>
                    </div>
                    ` : ''}
                    ${product.validade && config.showGrid ? `
                    <div class="campo">
                      <div class="label">VALID.:</div>
                      <div class="content">${escapeHtml(formatDateSafe(product.validade))}</div>
                    </div>
                    ` : ''}
                  </div>
                  ${product.validade && !config.showGrid ? `
                  <div class="campo">
                    <div class="label">VALID.:</div>
                    <div class="content">${escapeHtml(formatDateSafe(product.validade))}</div>
                  </div>
                  ` : ''}
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
                    <div class="content">${escapeHtml(responsavel.toUpperCase())}</div>
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

    const totalLabels = expandedProducts.length;
    toast({
      title: "Etiquetas enviadas para impressão",
      description: `${totalLabels} etiqueta(s) ${largura}x${altura}mm enviadas!`,
    });
  };

  const handlePrintSingle = (product: any) => {
    const quantity = product.quickPrintQuantity || 1;
    const expandedProducts = Array(quantity).fill(product);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiquetas - ${escapeHtml(product.nome || '')} (${quantity}x) - ${escapeHtml(largura.toString())}x${escapeHtml(altura.toString())}mm</title>
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
                margin-bottom: ${Math.max(2, parseInt(config.spacing) * 0.4)}px;
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
              ${expandedProducts.map(prod => `
                <div class="etiqueta ${config.compactMode ? 'compact' : ''}">
                  <div class="campo">
                    <div class="label">PRODUTO:</div>
                    <div class="content">${escapeHtml((prod.nome || '').toUpperCase())}</div>
                  </div>
                  <div class="grid">
                    <div class="campo">
                      <div class="label">LOTE:</div>
                      <div class="content">${escapeHtml((prod.lote || '').toUpperCase())}</div>
                    </div>
                    ${config.showGrid ? `
                    <div class="campo">
                      <div class="label">MARCA:</div>
                      <div class="content">${escapeHtml((prod.marca || '').toUpperCase())}</div>
                    </div>
                    ` : ''}
                  </div>
                  ${!config.showGrid ? `
                  <div class="campo">
                    <div class="label">MARCA:</div>
                    <div class="content">${escapeHtml((prod.marca || '').toUpperCase())}</div>
                  </div>
                  ` : ''}
                  ${prod.dataFabricacao || prod.validade ? `
                  <div class="grid">
                    ${prod.dataFabricacao ? `
                    <div class="campo">
                      <div class="label">FABRIC.:</div>
                      <div class="content">${escapeHtml(formatDateSafe(prod.dataFabricacao))}</div>
                    </div>
                    ` : ''}
                    ${prod.validade && config.showGrid ? `
                    <div class="campo">
                      <div class="label">VALID.:</div>
                      <div class="content">${escapeHtml(formatDateSafe(prod.validade))}</div>
                    </div>
                    ` : ''}
                  </div>
                  ${prod.validade && !config.showGrid ? `
                  <div class="campo">
                    <div class="label">VALID.:</div>
                    <div class="content">${escapeHtml(formatDateSafe(prod.validade))}</div>
                  </div>
                  ` : ''}
                  ` : ''}
                  <div class="grid">
                    <div class="campo">
                      <div class="label">ABERTURA:</div>
                      <div class="content">${escapeHtml(formatDateSafe(prod.dataAbertura))}</div>
                    </div>
                    ${config.showGrid ? `
                    <div class="campo">
                      <div class="label">USAR ATÉ:</div>
                      <div class="content">${escapeHtml(formatDateSafe(prod.utilizarAte))}</div>
                    </div>
                    ` : ''}
                  </div>
                  ${!config.showGrid ? `
                  <div class="campo">
                    <div class="label">USAR ATÉ:</div>
                    <div class="content">${escapeHtml(formatDateSafe(prod.utilizarAte))}</div>
                  </div>
                  ` : ''}
                  <div class="checkbox-row">
                    <div class="checkbox-item">
                      <span class="checkbox-mark">${prod.localArmazenamento === 'refrigerado' ? '■' : '□'}</span>
                      <span>REF</span>
                    </div>
                    <div class="checkbox-item">
                      <span class="checkbox-mark">${prod.localArmazenamento === 'congelado' ? '■' : '□'}</span>
                      <span>CON</span>
                    </div>
                    <div class="checkbox-item">
                      <span class="checkbox-mark">${prod.localArmazenamento === 'ambiente' ? '■' : '□'}</span>
                      <span>AMB</span>
                    </div>
                  </div>
                       ${!config.compactMode ? `
                      <div class="campo">
                        <div class="label">RESPONSÁVEL:</div>
                        <div class="content">${escapeHtml(responsavel.toUpperCase())}</div>
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
      description: `${quantity} etiqueta(s) de ${product.nome} (${largura}x${altura}mm) enviadas!`,
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MobileDrawer />
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden w-full">
          <div className="p-4 sm:p-6 lg:p-8 pt-14 sm:pt-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <SidebarTrigger className="hidden lg:flex text-muted-foreground" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Impressão de Etiquetas
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Impressão otimizada para impressoras térmicas
                </p>
              </div>
            </div>

            {/* Controles de Impressão */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Controles de Impressão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Checkbox
                      checked={selectedProducts.length === products.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                      <span className="hidden sm:inline">Selecionar todos</span>
                      <span className="sm:hidden">Todos</span> ({products.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="flex-1 sm:flex-none text-sm"
                          size="sm"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Configurações</span>
                          <span className="sm:hidden">Config</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Ruler className="w-5 h-5" />
                            <span>Ajuste Manual de Tamanho</span>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
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
                          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
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
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <Settings className="w-4 h-4 inline mr-1" />
                              Layout se adapta automaticamente • Salvo automaticamente
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      onClick={() => navigate('/visualizar-etiquetas')}
                      variant="outline"
                      className="flex-1 sm:flex-none text-sm"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Visualizar Etiquetas</span>
                      <span className="sm:hidden">Visualizar</span>
                    </Button>
                    <Button 
                      onClick={handlePrintRequest} 
                      disabled={selectedProducts.length === 0}
                      className="flex-1 sm:flex-none gradient-blue text-white text-sm"
                      size="sm"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Imprimir {largura}×{altura}mm</span>
                      <span className="sm:hidden">Imprimir</span>
                      {selectedProducts.length > 0 && ` (${Object.values(productQuantities).reduce((sum, qty) => sum + (qty || 0), 0)})`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações de Impressão */}
            {selectedProducts.length > 0 && (
              <Card className="mb-6 bg-primary/5 border-primary/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start sm:items-center space-x-2 text-primary text-xs sm:text-sm">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="font-medium">
                      {selectedProducts.length} produto{selectedProducts.length !== 1 ? 's' : ''} • {Object.values(productQuantities).reduce((sum, qty) => sum + (qty || 0), 0)} etiqueta(s) • {largura}×{altura}mm
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Editor de Etiqueta com Preview */}
            {showEditor && editingProduct && (
              <div ref={editorRef}>
                <Card className="mb-6 border-2 border-primary shadow-lg">
                  <CardContent className="pt-6">
                    <EtiquetaEditor
                      product={editingProduct}
                      largura={largura}
                      altura={altura}
                      onPrint={handleEditorPrint}
                      onClose={() => {
                        setShowEditor(false);
                        setEditingProduct(null);
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Botões de Impressão Rápida */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Impressão Rápida - Produtos Cadastrados</span>
                  <span className="sm:hidden">Impressão Rápida</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Clique em Editar para personalizar a etiqueta antes de imprimir
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(product => {
                    const currentQuantity = quickPrintQuantities[product.id] || 1;
                    return (
                      <div key={product.id} className="relative border-2 rounded-lg p-4 sm:p-5 hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20">
                        <div className="flex items-start space-x-3 sm:space-x-4 mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-foreground truncate text-base sm:text-lg">
                              {product.nome}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate mt-1">
                              Lote: {product.lote || 'N/A'} | {product.marca || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <Label htmlFor={`qty-${product.id}`} className="text-xs sm:text-sm whitespace-nowrap">
                                Qtd:
                              </Label>
                              <Input
                                id={`qty-${product.id}`}
                                type="number"
                                min="1"
                                max="99"
                                value={currentQuantity}
                                onChange={(e) => handleQuickPrintQuantityChange(product.id, parseInt(e.target.value) || 1)}
                                className="w-16 sm:w-20 h-9 text-center"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => handlePrintSingleRequest(product, currentQuantity)}
                            >
                              <Printer className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">Imprimir</span>
                              <span className="sm:hidden">Print</span>
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            <span>Editar e Preview</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {products.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>Nenhum produto cadastrado ainda.</p>
                    <p className="text-sm">Cadastre produtos para usar a impressão rápida.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seleção Multiple Tradicional */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Checkbox className="mr-2" />
                  <span className="hidden sm:inline">Seleção Múltipla - Para Impressão em Lote</span>
                  <span className="sm:hidden">Seleção Múltipla</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 hover:border-primary hover:scale-[1.02] bg-gradient-to-br from-card to-primary/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() => handleSelectProduct(product.id)}
                            />
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-sm font-bold">{product.nome}</CardTitle>
                          </div>
                          {selectedProducts.includes(product.id) && (
                            <div className="flex items-center space-x-2">
                              <Label className="text-xs text-gray-600">Qtd:</Label>
                              <Input
                                type="number"
                                min="1"
                                max="99"
                                value={productQuantities[product.id] || 1}
                                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                                className="w-16 h-8 text-center text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
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

            {/* Dialog para selecionar responsável */}
            <Dialog open={showResponsavelDialog} onOpenChange={setShowResponsavelDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Selecione o Responsável</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <ResponsavelSelectField
                    label="Responsável"
                    value={responsavel}
                    onChange={setResponsavel}
                    required={true}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowResponsavelDialog(false);
                        setResponsavel('');
                        setPrintAction(null);
                        setSingleProductToPrint(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={executePrint}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ImpressaoEtiquetas;
