import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";

interface EtiquetaPreviewProps {
  product: Product;
  largura?: number;
  altura?: number;
}

export function EtiquetaPreview({ product, largura = 70, altura = 50 }: EtiquetaPreviewProps) {
  const formatDate = (date: Date | undefined | string) => {
    if (!date) return '';
    
    try {
      if (typeof date === 'string') {
        if (date.includes('/')) {
          if (date.match(/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]+\/\d{4}$/)) {
            return date;
          } else if (date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            return date;
          } else if (date.match(/^\d{1,2}\/\d{4}$/)) {
            return date;
          }
        } else {
          const [year, month, day] = date.split('-').map(Number);
          if (year && month && day) {
            const dateObj = new Date(year, month - 1, day);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toLocaleDateString('pt-BR');
            }
          }
        }
      }
      
      if (date instanceof Date) {
        if (isNaN(date.getTime())) {
          return '';
        }
        return date.toLocaleDateString('pt-BR');
      }
      
      return String(date);
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return '';
    }
  };

  // Conversão para pixels para visualização na tela (1mm ≈ 3.78px)
  const screenWidth = `${largura * 3.78}px`;
  const screenHeight = `${altura * 3.78}px`;

  // Cálculo responsivo baseado no tamanho da etiqueta
  const baseWidth = 70;
  const scaleFactor = largura / baseWidth;
  
  const fontSize = 10 * scaleFactor;
  const spacing = 1.2 * scaleFactor;
  const padding = 3 * scaleFactor;
  const lineHeight = fontSize + (1.5 * scaleFactor);

  return (
    <Card 
      className="etiqueta-preview border-2 border-gray-400 bg-white overflow-hidden shadow-lg"
      style={{ 
        width: screenWidth,
        height: screenHeight,
      }}
    >
      <CardContent 
        className="font-sans h-full"
        style={{ 
          padding: `${padding}px`,
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize + 2}px`
        }}
      >
        <div className="h-full flex flex-col" style={{ gap: `${spacing * 0.5}px` }}>
          
          {/* Nome do Produto */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.4}px` }}>
            <div className="flex items-center" style={{ marginBottom: `${spacing * 0.3}px` }}>
              <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>Nome do Produto:</span>
              <div 
                className="flex-1 border-b-2 border-black relative"
                style={{ height: `${lineHeight}px` }}
              >
                <span 
                  className="absolute left-1 top-0 font-bold text-black uppercase overflow-hidden"
                  style={{ fontSize: `${fontSize * 0.95}px`, lineHeight: `${lineHeight}px` }}
                >
                  {product.nome || ''}
                </span>
              </div>
            </div>
            <div 
              className="w-full border-b-2 border-black"
              style={{ height: `${lineHeight}px` }}
            />
          </div>

          {/* Lote e Marca */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.4}px` }}>
            <div className="flex items-center" style={{ gap: `${spacing * 2}px` }}>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>Lote nº:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black uppercase overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.95}px`, lineHeight: `${lineHeight}px` }}
                  >
                    {product.lote || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>Marca:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black uppercase overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.95}px`, lineHeight: `${lineHeight}px` }}
                  >
                    {product.marca || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fab. e Val. */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.4}px` }}>
            <div className="flex items-center" style={{ gap: `${spacing * 2}px` }}>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>Fab.:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.95}px`, lineHeight: `${lineHeight}px` }}
                  >
                    {formatDate(product.dataFabricacao) || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>Val.:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.95}px`, lineHeight: `${lineHeight}px` }}
                  >
                    {formatDate(product.validade) || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DT Abert. e Utilizar até */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.4}px` }}>
            <div className="flex items-center" style={{ gap: `${spacing * 2}px` }}>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>DT Abert:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.95}px`, lineHeight: `${lineHeight}px` }}
                  >
                    {formatDate(product.dataAbertura) || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>Utilizar até:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.95}px`, lineHeight: `${lineHeight}px` }}
                  >
                    {formatDate(product.utilizarAte) || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.4}px` }}>
            <div className="flex items-center justify-start" style={{ gap: `${spacing * 4}px` }}>
              <label className="flex items-center" style={{ gap: `${spacing * 0.8}px` }}>
                <div 
                  className="border-2 border-black flex items-center justify-center bg-white flex-shrink-0"
                  style={{ width: `${fontSize * 1.2}px`, height: `${fontSize * 1.2}px` }}
                >
                  {product.localArmazenamento === 'refrigerado' && (
                    <span className="text-black font-bold leading-none" style={{ fontSize: `${fontSize * 0.9}px` }}>✓</span>
                  )}
                </div>
                <span className="font-bold text-black whitespace-nowrap">Refrigerado</span>
              </label>
              <label className="flex items-center" style={{ gap: `${spacing * 0.8}px` }}>
                <div 
                  className="border-2 border-black flex items-center justify-center bg-white flex-shrink-0"
                  style={{ width: `${fontSize * 1.2}px`, height: `${fontSize * 1.2}px` }}
                >
                  {product.localArmazenamento === 'congelado' && (
                    <span className="text-black font-bold leading-none" style={{ fontSize: `${fontSize * 0.9}px` }}>✓</span>
                  )}
                </div>
                <span className="font-bold text-black whitespace-nowrap">Congelado</span>
              </label>
              <label className="flex items-center" style={{ gap: `${spacing * 0.8}px` }}>
                <div 
                  className="border-2 border-black flex items-center justify-center bg-white flex-shrink-0"
                  style={{ width: `${fontSize * 1.2}px`, height: `${fontSize * 1.2}px` }}
                >
                  {product.localArmazenamento === 'ambiente' && (
                    <span className="text-black font-bold leading-none" style={{ fontSize: `${fontSize * 0.9}px` }}>✓</span>
                  )}
                </div>
                <span className="font-bold text-black whitespace-nowrap">Ambiente</span>
              </label>
            </div>
          </div>

          {/* Responsável */}
          <div className="flex-none">
            <div className="flex items-center">
              <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>Responsável:</span>
              <div 
                className="flex-1 border-b-2 border-black relative"
                style={{ height: `${lineHeight}px` }}
              >
                <span 
                  className="absolute left-1 top-0 font-bold text-black uppercase overflow-hidden"
                  style={{ fontSize: `${fontSize * 0.95}px`, lineHeight: `${lineHeight}px` }}
                >
                  {product.responsavel || ''}
                </span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
