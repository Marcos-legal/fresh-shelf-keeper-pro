
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

  // Cálculo responsivo MELHORADO baseado no tamanho da etiqueta
  const area = largura * altura;
  
  // Ajuste fino para manter proporções consistentes
  let fontSize, spacing, padding, lineHeight;
  
  if (area < 2000) {
    fontSize = Math.max(6, Math.min(9, Math.sqrt(area) * 0.22));
  } else if (area < 4000) {
    fontSize = Math.max(8, Math.min(11, Math.sqrt(area) * 0.23));
  } else if (area < 8000) {
    fontSize = Math.max(9, Math.min(13, Math.sqrt(area) * 0.24));
  } else {
    fontSize = Math.max(10, Math.min(15, Math.sqrt(area) * 0.25));
  }
  
  spacing = Math.max(1, fontSize * 0.1);
  padding = Math.max(3, fontSize * 0.45);
  lineHeight = fontSize + 1.5;

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
        <div className="h-full flex flex-col" style={{ gap: `${spacing}px` }}>
          
          {/* Nome do Produto - 2 linhas */}
          <div className="flex-none">
            <div className="flex items-center mb-1">
              <span className="font-bold text-black mr-2">Nome do Produto:</span>
              <div 
                className="flex-1 border-b-2 border-black relative"
                style={{ height: `${lineHeight}px` }}
              >
                <span 
                  className="absolute left-1 top-0 font-bold text-black uppercase"
                  style={{ fontSize: `${fontSize - 1}px` }}
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
          <div className="flex-none">
            <div className="flex items-center gap-6">
              <div className="flex items-center flex-1">
                <span className="font-bold text-black mr-2">Lote nº:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black uppercase"
                    style={{ fontSize: `${fontSize - 1}px` }}
                  >
                    {product.lote || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black mr-2">Marca:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black uppercase"
                    style={{ fontSize: `${fontSize - 1}px` }}
                  >
                    {product.marca || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fab. e Val. - mesma linha */}
          <div className="flex-none">
            <div className="flex items-center gap-6">
              <div className="flex items-center flex-1">
                <span className="font-bold text-black mr-2">Fab.:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black"
                    style={{ fontSize: `${fontSize - 1}px` }}
                  >
                    {formatDate(product.dataFabricacao) || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black mr-2">Val.:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black"
                    style={{ fontSize: `${fontSize - 1}px` }}
                  >
                    {formatDate(product.validade) || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DT Abert. e Utilizar até - mesma linha */}
          <div className="flex-none">
            <div className="flex items-center gap-6">
              <div className="flex items-center flex-1">
                <span className="font-bold text-black mr-2">DT Abert:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black"
                    style={{ fontSize: `${fontSize - 1}px` }}
                  >
                    {formatDate(product.dataAbertura) || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black mr-2">Utilizar até:</span>
                <div 
                  className="flex-1 border-b-2 border-black relative"
                  style={{ height: `${lineHeight}px` }}
                >
                  <span 
                    className="absolute left-1 top-0 font-bold text-black"
                    style={{ fontSize: `${fontSize - 1}px` }}
                  >
                    {formatDate(product.utilizarAte) || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkboxes - Uma linha com 3 opções */}
          <div className="flex-none">
            <div className="flex items-center justify-start gap-8">
              <label className="flex items-center gap-2">
                <div 
                  className="border-2 border-black flex items-center justify-center bg-white"
                  style={{ width: `${fontSize + 2}px`, height: `${fontSize + 2}px` }}
                >
                  {product.localArmazenamento === 'refrigerado' && (
                    <span className="text-black font-bold" style={{ fontSize: `${fontSize - 2}px` }}>✓</span>
                  )}
                </div>
                <span className="font-bold text-black">Refrigerado</span>
              </label>
              <label className="flex items-center gap-2">
                <div 
                  className="border-2 border-black flex items-center justify-center bg-white"
                  style={{ width: `${fontSize + 2}px`, height: `${fontSize + 2}px` }}
                >
                  {product.localArmazenamento === 'congelado' && (
                    <span className="text-black font-bold" style={{ fontSize: `${fontSize - 2}px` }}>✓</span>
                  )}
                </div>
                <span className="font-bold text-black">Congelado</span>
              </label>
              <label className="flex items-center gap-2">
                <div 
                  className="border-2 border-black flex items-center justify-center bg-white"
                  style={{ width: `${fontSize + 2}px`, height: `${fontSize + 2}px` }}
                >
                  {product.localArmazenamento === 'ambiente' && (
                    <span className="text-black font-bold" style={{ fontSize: `${fontSize - 2}px` }}>✓</span>
                  )}
                </div>
                <span className="font-bold text-black">Ambiente</span>
              </label>
            </div>
          </div>

          {/* Responsável - linha final */}
          <div className="flex-none">
            <div className="flex items-center">
              <span className="font-bold text-black mr-2">Responsável:</span>
              <div 
                className="flex-1 border-b-2 border-black relative"
                style={{ height: `${lineHeight}px` }}
              >
                <span 
                  className="absolute left-1 top-0 font-bold text-black uppercase"
                  style={{ fontSize: `${fontSize - 1}px` }}
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
