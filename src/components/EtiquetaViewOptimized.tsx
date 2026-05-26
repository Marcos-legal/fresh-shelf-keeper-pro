
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { buildEtiquetaQrPayload } from "@/lib/qrcode";
import { calculateLabelScale } from "@/config/labelSizePresets";

interface EtiquetaViewOptimizedProps {
  product: Product;
  largura?: number;
  altura?: number;
}

export function EtiquetaViewOptimized({ 
  product, 
  largura = 70, 
  altura = 50 
}: EtiquetaViewOptimizedProps) {
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

  // Cálculo responsivo otimizado
  const scale = calculateLabelScale(largura, altura);
  
  const {
    fontSize,
    nameFontSize,
    spacing,
    padding,
    lineHeight,
    isCompactMode,
    qrSize
  } = scale;

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
        <div className="h-full flex flex-col" style={{ gap: `${spacing * 0.3}px` }}>
          
          {/* Nome do Produto - DESTAQUE */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
            <div
              className="w-full bg-black text-white flex items-center justify-center font-black uppercase tracking-wide overflow-hidden"
              style={{
                height: `${(nameFontSize + 2) * (isCompactMode ? 1.2 : 1.4)}px`,
                fontSize: `${nameFontSize * (isCompactMode ? 0.9 : 1)}px`,
                lineHeight: 1,
                padding: `0 ${spacing * 0.5}px`,
                letterSpacing: isCompactMode ? '0px' : '0.5px',
              }}
            >
              <span className="truncate text-center w-full">{product.nome || ''}</span>
            </div>
          </div>

          {/* Linha 1: Lote e Marca (lado a lado) */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
            <div className="flex items-center" style={{ gap: `${spacing}px` }}>
              <div className="flex items-center flex-1 min-w-0">
                <span 
                  className="font-bold text-black whitespace-nowrap flex-shrink-0"
                  style={{ marginRight: `${spacing * 0.5}px`, fontSize: `${fontSize * 0.85}px` }}
                >
                  {isCompactMode ? 'Lte:' : 'Lote:'}
                </span>
                <div 
                  className="flex-1 border-b border-black relative"
                  style={{ height: `${lineHeight * 0.9}px` }}
                >
                  <span 
                    className="absolute left-0.5 top-0 font-bold text-black uppercase overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.8}px`, lineHeight: `${lineHeight * 0.9}px` }}
                  >
                    {product.lote || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-1 min-w-0">
                <span 
                  className="font-bold text-black whitespace-nowrap flex-shrink-0"
                  style={{ marginRight: `${spacing * 0.5}px`, fontSize: `${fontSize * 0.85}px` }}
                >
                  {isCompactMode ? 'Mrc:' : 'Marca:'}
                </span>
                <div 
                  className="flex-1 border-b border-black relative"
                  style={{ height: `${lineHeight * 0.9}px` }}
                >
                  <span 
                    className="absolute left-0.5 top-0 font-bold text-black uppercase overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.8}px`, lineHeight: `${lineHeight * 0.9}px` }}
                  >
                    {product.marca || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Linha 2: Fabricação e Validade (lado a lado) */}
          <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
            <div className="flex items-center" style={{ gap: `${spacing}px` }}>
              <div className="flex items-center flex-1 min-w-0">
                <span 
                  className="font-bold text-black whitespace-nowrap flex-shrink-0"
                  style={{ marginRight: `${spacing * 0.5}px`, fontSize: `${fontSize * 0.85}px` }}
                >
                  {isCompactMode ? 'Fab:' : 'Fab.:'}
                </span>
                <div 
                  className="flex-1 border-b border-black relative"
                  style={{ height: `${lineHeight * 0.9}px` }}
                >
                  <span 
                    className="absolute left-0.5 top-0 font-bold text-black overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.8}px`, lineHeight: `${lineHeight * 0.9}px` }}
                  >
                    {formatDate(product.dataFabricacao) || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-1 min-w-0">
                <span 
                  className="font-bold text-black whitespace-nowrap flex-shrink-0"
                  style={{ marginRight: `${spacing * 0.5}px`, fontSize: `${fontSize * 0.85}px` }}
                >
                  Val.:
                </span>
                <div 
                  className="flex-1 border-b border-black relative"
                  style={{ height: `${lineHeight * 0.9}px` }}
                >
                  <span 
                    className="absolute left-0.5 top-0 font-bold text-black overflow-hidden"
                    style={{ fontSize: `${fontSize * 0.8}px`, lineHeight: `${lineHeight * 0.9}px` }}
                  >
                    {formatDate(product.validade) || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Linha 3: Abertura e Usar até (lado a lado) - com display condicional */}
          {!isCompactMode && (
            <div className="flex-none" style={{ marginBottom: `${spacing * 0.2}px` }}>
              <div className="flex items-center" style={{ gap: `${spacing}px` }}>
                <div className="flex items-center flex-1 min-w-0">
                  <span 
                    className="font-bold text-black whitespace-nowrap flex-shrink-0"
                    style={{ marginRight: `${spacing * 0.5}px`, fontSize: `${fontSize * 0.85}px` }}
                  >
                    Aber.:
                  </span>
                  <div 
                    className="flex-1 border-b border-black relative"
                    style={{ height: `${lineHeight * 0.9}px` }}
                  >
                    <span 
                      className="absolute left-0.5 top-0 font-bold text-black overflow-hidden"
                      style={{ fontSize: `${fontSize * 0.8}px`, lineHeight: `${lineHeight * 0.9}px` }}
                    >
                      {formatDate(product.dataAbertura) || ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <span 
                    className="font-bold text-black whitespace-nowrap flex-shrink-0"
                    style={{ marginRight: `${spacing * 0.5}px`, fontSize: `${fontSize * 0.85}px` }}
                  >
                    Usar:
                  </span>
                  <div 
                    className="flex-1 border-b border-black relative"
                    style={{ height: `${lineHeight * 0.9}px` }}
                  >
                    <span 
                      className="absolute left-0.5 top-0 font-bold text-black overflow-hidden"
                      style={{ fontSize: `${fontSize * 0.8}px`, lineHeight: `${lineHeight * 0.9}px` }}
                    >
                      {formatDate(product.utilizarAte) || ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Checkboxes - Armazenamento (adaptado para modo compacto) */}
          <div 
            className="flex-none" 
            style={{ 
              marginBottom: `${spacing * 0.2}px`,
              display: 'grid',
              gridTemplateColumns: isCompactMode ? '1fr 1fr 1fr' : '1fr 1fr 1fr',
              gap: `${spacing * 0.5}px`,
              fontSize: `${fontSize * 0.75}px`
            }}
          >
            {[
              { key: 'refrigerado', label: isCompactMode ? 'REF' : 'Refrigerado' },
              { key: 'congelado', label: isCompactMode ? 'CON' : 'Congelado' },
              { key: 'ambiente', label: isCompactMode ? 'AMB' : 'Ambiente' },
            ].map(({ key, label }) => {
              const active = product.localArmazenamento === key;
              const cbSize = fontSize * 0.9;
              return (
                <label 
                  key={key} 
                  className="flex items-center" 
                  style={{ gap: `${spacing * 0.3}px` }}
                >
                  <div
                    className="border border-black flex-shrink-0"
                    style={{
                      width: `${cbSize}px`,
                      height: `${cbSize}px`,
                      background: active ? '#000' : '#fff',
                    }}
                  />
                  <span className="font-bold text-black whitespace-nowrap text-ellipsis overflow-hidden">
                    {label}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Responsável e QR Code - linha final */}
          <div className="flex-1 min-h-0 flex items-end gap-1">
            <div className="flex items-center flex-1 min-w-0">
              <span 
                className="font-bold text-black whitespace-nowrap flex-shrink-0"
                style={{ marginRight: `${spacing * 0.3}px`, fontSize: `${fontSize * 0.85}px` }}
              >
                {isCompactMode ? 'Resp:' : 'Responsável:'}
              </span>
              <div
                className="flex-1 border-b border-black relative"
                style={{ height: `${lineHeight * 0.85}px` }}
              >
                <span
                  className="absolute left-0.5 top-0 font-bold text-black uppercase overflow-hidden text-ellipsis"
                  style={{ fontSize: `${fontSize * 0.75}px`, lineHeight: `${lineHeight * 0.85}px` }}
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
                marginSize={1}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
