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

  // Detecção do tipo de impressora
  const isCompact = largura <= 57;
  const isMedium = largura > 57 && largura <= 80;
  const isLarge = largura > 80;

  // Cálculo responsivo avançado baseado no tamanho
  const baseWidth = 70;
  const scaleFactor = largura / baseWidth;
  const area = largura * altura;
  
  // Valores adaptativos por tamanho
  let fontSize, nameFontSize, labelFontSize, spacing, padding, lineHeight, nameLineHeight;
  
  if (isCompact) { // 57mm - Modo ultra compacto
    fontSize = 7;
    labelFontSize = 6;
    nameFontSize = 9;
    spacing = 0.8;
    padding = 2;
    lineHeight = 8;
    nameLineHeight = 10;
  } else if (isMedium) { // 57-80mm - Modo compacto
    fontSize = Math.max(8, Math.min(10, area / 450));
    labelFontSize = fontSize - 1;
    nameFontSize = fontSize * 1.3;
    spacing = 1;
    padding = 2.5;
    lineHeight = fontSize + 1;
    nameLineHeight = nameFontSize + 1;
  } else { // 80mm+ - Modo normal
    fontSize = 10 * scaleFactor;
    labelFontSize = fontSize - 1;
    nameFontSize = fontSize * 1.55;
    spacing = 1.2 * scaleFactor;
    padding = 3 * scaleFactor;
    lineHeight = fontSize + 1.5;
    nameLineHeight = nameFontSize + 2;
  }

  return (
    <Card 
      className="etiqueta-preview border-2 border-gray-400 bg-white overflow-hidden shadow-lg"
      style={{ 
        width: screenWidth,
        height: screenHeight,
      }}
    >
      <CardContent 
        className="font-sans h-full flex flex-col"
        style={{ 
          padding: `${padding}px`,
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          gap: `${spacing * 0.3}px`
        }}
      >
        
        {/* Nome do Produto - DESTAQUE */}
        <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
          <div
            className="w-full bg-black text-white flex items-center justify-center font-black uppercase tracking-tight overflow-hidden text-center"
            style={{
              height: isCompact ? `${nameLineHeight * 1.1}px` : `${nameLineHeight * 1.3}px`,
              fontSize: `${nameFontSize}px`,
              lineHeight: 1,
              padding: `0 ${spacing * 0.5}px`,
              letterSpacing: '0.3px',
            }}
          >
            <span className="truncate">{product.nome || ''}</span>
          </div>
        </div>

        {/* Lote e Marca - em uma linha quando compacto */}
        {isCompact ? (
          // Modo ultra compacto: tudo em uma linha
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
            <div className="flex items-center justify-between" style={{ gap: `${spacing * 0.5}px` }}>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-black text-xs" style={{ fontSize: `${labelFontSize}px` }}>LOTE:</span>
                <div 
                  className="border-b border-black"
                  style={{ height: `${lineHeight - 1}px` }}
                >
                  <span 
                    className="font-bold text-black uppercase"
                    style={{ fontSize: `${fontSize - 1}px`, lineHeight: `${lineHeight - 1}px` }}
                  >
                    {product.lote || ''}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-black text-xs" style={{ fontSize: `${labelFontSize}px` }}>MARCA:</span>
                <div 
                  className="border-b border-black"
                  style={{ height: `${lineHeight - 1}px` }}
                >
                  <span 
                    className="font-bold text-black uppercase"
                    style={{ fontSize: `${fontSize - 1}px`, lineHeight: `${lineHeight - 1}px` }}
                  >
                    {product.marca || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Modo normal: duas linhas
          <>
            <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
              <div className="flex items-center" style={{ gap: `${spacing}px` }}>
                <div className="flex-1">
                  <span className="font-bold text-black" style={{ fontSize: `${labelFontSize}px` }}>Lote:</span>
                  <div 
                    className="flex-1 border-b-2 border-black"
                    style={{ height: `${lineHeight}px` }}
                  >
                    <span 
                      className="font-bold text-black uppercase"
                      style={{ fontSize: `${fontSize * 0.95}px` }}
                    >
                      {product.lote || ''}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-bold text-black" style={{ fontSize: `${labelFontSize}px` }}>Marca:</span>
                  <div 
                    className="flex-1 border-b-2 border-black"
                    style={{ height: `${lineHeight}px` }}
                  >
                    <span 
                      className="font-bold text-black uppercase"
                      style={{ fontSize: `${fontSize * 0.95}px` }}
                    >
                      {product.marca || ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Datas - Fab. e Val. */}
        <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
          <div className="flex items-center" style={{ gap: `${spacing * 0.5}px` }}>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-black" style={{ fontSize: `${labelFontSize}px`, whiteSpace: 'nowrap' }}>Fab:</span>
              <div 
                className="border-b border-black relative"
                style={{ height: `${lineHeight - 1}px` }}
              >
                <span 
                  className="font-bold text-black"
                  style={{ fontSize: `${fontSize - 1}px` }}
                >
                  {formatDate(product.dataFabricacao) || ''}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-black" style={{ fontSize: `${labelFontSize}px`, whiteSpace: 'nowrap' }}>Val:</span>
              <div 
                className="border-b border-black relative"
                style={{ height: `${lineHeight - 1}px` }}
              >
                <span 
                  className="font-bold text-black"
                  style={{ fontSize: `${fontSize - 1}px` }}
                >
                  {formatDate(product.validade) || ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DT Abert. e Usar até */}
        <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
          <div className="flex items-center" style={{ gap: `${spacing * 0.5}px` }}>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-black" style={{ fontSize: `${labelFontSize}px`, whiteSpace: 'nowrap' }}>Abert:</span>
              <div 
                className="border-b border-black relative"
                style={{ height: `${lineHeight - 1}px` }}
              >
                <span 
                  className="font-bold text-black"
                  style={{ fontSize: `${fontSize - 1}px` }}
                >
                  {formatDate(product.dataAbertura) || ''}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-black" style={{ fontSize: `${labelFontSize}px`, whiteSpace: 'nowrap' }}>Usar:</span>
              <div 
                className="border-b border-black relative"
                style={{ height: `${lineHeight - 1}px` }}
              >
                <span 
                  className="font-bold text-black"
                  style={{ fontSize: `${fontSize - 1}px` }}
                >
                  {formatDate(product.utilizarAte) || ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkboxes - Compactado */}
        <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
          <div className="flex items-center justify-between" style={{ gap: `${spacing}px` }}>
            <label className="flex items-center" style={{ gap: `${spacing * 0.3}px` }}>
              <div 
                className="border border-black flex items-center justify-center bg-white flex-shrink-0"
                style={{ width: `${fontSize * 1.1}px`, height: `${fontSize * 1.1}px` }}
              >
                {product.localArmazenamento === 'refrigerado' && (
                  <span className="text-black font-bold leading-none" style={{ fontSize: `${fontSize * 0.8}px` }}>■</span>
                )}
              </div>
              <span className="font-bold text-black whitespace-nowrap" style={{ fontSize: `${labelFontSize}px` }}>REF</span>
            </label>
            <label className="flex items-center" style={{ gap: `${spacing * 0.3}px` }}>
              <div 
                className="border border-black flex items-center justify-center bg-white flex-shrink-0"
                style={{ width: `${fontSize * 1.1}px`, height: `${fontSize * 1.1}px` }}
              >
                {product.localArmazenamento === 'congelado' && (
                  <span className="text-black font-bold leading-none" style={{ fontSize: `${fontSize * 0.8}px` }}>■</span>
                )}
              </div>
              <span className="font-bold text-black whitespace-nowrap" style={{ fontSize: `${labelFontSize}px` }}>CON</span>
            </label>
            <label className="flex items-center" style={{ gap: `${spacing * 0.3}px` }}>
              <div 
                className="border border-black flex items-center justify-center bg-white flex-shrink-0"
                style={{ width: `${fontSize * 1.1}px`, height: `${fontSize * 1.1}px` }}
              >
                {product.localArmazenamento === 'ambiente' && (
                  <span className="text-black font-bold leading-none" style={{ fontSize: `${fontSize * 0.8}px` }}>■</span>
                )}
              </div>
              <span className="font-bold text-black whitespace-nowrap" style={{ fontSize: `${labelFontSize}px` }}>AMB</span>
            </label>
          </div>
        </div>

        {/* Responsável - Minificado */}
        {!isCompact && (
          <div className="flex-none flex-1 flex items-end">
            <div className="flex items-center w-full">
              <span className="font-bold text-black" style={{ fontSize: `${labelFontSize}px`, whiteSpace: 'nowrap' }}>Resp:</span>
              <div 
                className="flex-1 border-b border-black relative ml-1"
                style={{ height: `${lineHeight - 1}px` }}
              >
                <span 
                  className="font-bold text-black uppercase"
                  style={{ fontSize: `${fontSize - 1}px` }}
                >
                  {product.responsavel || ''}
                </span>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
