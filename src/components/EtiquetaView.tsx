
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { buildEtiquetaQrPayload } from "@/lib/qrcode";

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
  // Base: etiqueta 70x50mm (proporção 7:5)
  const baseWidth = 70;
  const baseHeight = 50;
  const baseFontSize = 10;
  
  // Escala proporcional uniforme baseada APENAS na largura para manter proporções exatas
  // Isso garante que o layout permaneça idêntico, apenas maior ou menor
  const scaleFactor = largura / baseWidth;
  
  // Todos os tamanhos escalam proporcionalmente com o mesmo fator
  const fontSize = baseFontSize * scaleFactor;
  const spacing = 1.2 * scaleFactor;
  const padding = 3 * scaleFactor;
  const lineHeight = fontSize + (1.5 * scaleFactor);
  const nameFontSize = fontSize * 1.55;
  const nameLineHeight = nameFontSize + (2 * scaleFactor);
  const qrSize = Math.max(28, fontSize * 3);

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
          
          {/* Nome do Produto - DESTAQUE */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.5}px` }}>
            <div
              className="w-full bg-black text-white flex items-center justify-center font-black uppercase tracking-wide overflow-hidden"
              style={{
                height: `${nameLineHeight * 1.4}px`,
                fontSize: `${nameFontSize}px`,
                lineHeight: 1,
                padding: `0 ${spacing}px`,
                letterSpacing: '0.5px',
              }}
            >
              <span className="truncate text-center w-full">{product.nome || ''}</span>
            </div>
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

          {/* Abertura e Usar até - mesma linha */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.4}px` }}>
            <div className="flex items-center" style={{ gap: `${spacing * 2}px` }}>
              <div className="flex items-center flex-1">
                <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>Abertura:</span>
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
                <span className="font-bold text-black" style={{ marginRight: `${spacing}px`, whiteSpace: 'nowrap' }}>Usar até:</span>
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

          {/* Checkboxes - REF / CON / AMB */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.4}px` }}>
            <div className="flex items-center justify-start" style={{ gap: `${spacing * 4}px` }}>
              {[
                { key: 'refrigerado', label: 'REF' },
                { key: 'congelado', label: 'CON' },
                { key: 'ambiente', label: 'AMB' },
              ].map(({ key, label }) => {
                const active = product.localArmazenamento === key;
                return (
                  <label key={key} className="flex items-center" style={{ gap: `${spacing * 0.8}px` }}>
                    <div
                      className="border-2 border-black flex-shrink-0"
                      style={{
                        width: `${fontSize * 1.2}px`,
                        height: `${fontSize * 1.2}px`,
                        background: active ? '#000' : '#fff',
                      }}
                    />
                    <span className="font-bold text-black whitespace-nowrap">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>


          {/* Responsável e QR Code - linha final */}
          <div className="flex-1 min-h-0">
            <div className="flex h-full items-end gap-2">
              <div className="flex items-center flex-1 min-w-0 pb-0.5">
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
              <div
                className="flex-shrink-0 bg-white flex items-center justify-center"
                style={{ width: `${qrSize}px`, height: `${qrSize}px` }}
              >
                <QRCodeSVG
                  value={buildEtiquetaQrPayload(product)}
                  size={qrSize}
                  level="L"
                  marginSize={2}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
