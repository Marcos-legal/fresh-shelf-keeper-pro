
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";

interface EtiquetaViewProps {
  product: Product;
  largura?: number;
  altura?: number;
}

export function EtiquetaView({ product, largura = 70, altura = 50 }: EtiquetaViewProps) {
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

  // Conversão otimizada para impressão térmica
  const widthMm = largura;
  const heightMm = altura;
  
  // Usar unidades CSS em mm para impressão precisa
  const cssWidth = `${widthMm}mm`;
  const cssHeight = `${heightMm}mm`;
  
  // Para visualização na tela (conversão aproximada: 1mm = 3.78px)
  const screenWidth = `${widthMm * 3.78}px`;
  const screenHeight = `${heightMm * 3.78}px`;

  // Cálculo responsivo PROPORCIONAL - mantém layout idêntico independente do tamanho
  // Base: etiqueta 70x50mm
  const baseWidth = 70;
  const baseHeight = 50;
  const baseFontSize = 10;
  
  // Escala proporcional baseada na menor dimensão para manter o layout
  const scaleFactor = Math.min(largura / baseWidth, altura / baseHeight);
  
  // Todos os tamanhos escalam proporcionalmente
  const fontSize = baseFontSize * scaleFactor;
  const spacing = 1.2 * scaleFactor; // Reduzido de 1.5 para 1.2
  const padding = 3 * scaleFactor; // Reduzido de 4 para 3
  const lineHeight = fontSize + (1.5 * scaleFactor); // Reduzido de 2 para 1.5

  return (
    <Card 
      className="etiqueta-termica border-2 border-gray-400 bg-white overflow-hidden"
      style={{ 
        // Usar px para visualização na tela
        width: screenWidth,
        height: screenHeight,
        // CSS custom properties para impressão
        '--etiqueta-width': cssWidth,
        '--etiqueta-height': cssHeight,
        '--etiqueta-font-size': `${fontSize}px`,
        '--etiqueta-spacing': `${spacing}px`,
        '--etiqueta-padding': `${padding}px`,
        '--etiqueta-line-height': `${lineHeight}px`
      } as React.CSSProperties}
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
          
          {/* Nome do Produto - 2 linhas */}
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

          {/* Lote e Marca - mesma linha */}
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

          {/* Fab. e Val. - mesma linha */}
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

          {/* DT Abert. e Utilizar até - mesma linha */}
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

          {/* Checkboxes - Uma linha com 3 opções */}
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

          {/* Responsável - linha final */}
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
