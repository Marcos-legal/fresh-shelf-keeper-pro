
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";

interface EtiquetaViewProps {
  product: Product;
  largura?: number;
  altura?: number;
}

export function EtiquetaView({ product, largura = 70, altura = 50 }: EtiquetaViewProps) {
  const showOptionalDates = product.showOptionalDates ?? false;

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

  // Calcular configurações responsivas baseadas no tamanho
  const getResponsiveConfig = () => {
    const area = largura * altura;
    const aspectRatio = largura / altura;
    
    let fontSize, padding, spacing;
    
    if (area < 2000) { // Muito pequena
      fontSize = 10;
      padding = 8;
      spacing = 2;
    } else if (area < 4000) { // Pequena
      fontSize = 11;
      padding = 12;
      spacing = 3;
    } else if (area < 8000) { // Média
      fontSize = 12;
      padding = 16;
      spacing = 4;
    } else { // Grande
      fontSize = 14;
      padding = 20;
      spacing = 6;
    }

    return {
      width: Math.max(280, largura * 4), // Conversão aproximada mm para px
      height: Math.max(200, altura * 4),
      fontSize,
      padding,
      spacing,
      showGrid: aspectRatio > 1.2, // Grid se for mais largo
      compactMode: area < 2500 // Modo compacto
    };
  };

  const config = getResponsiveConfig();
  const hasCompleteData = product.nome && product.lote && product.marca && 
    product.dataAbertura && product.utilizarAte && product.responsavel;

  return (
    <Card 
      className="border-2 border-gray-400 bg-white overflow-hidden"
      style={{ 
        width: `${config.width}px`,
        height: `${config.height}px`
      }}
    >
      <CardContent 
        className={`font-mono ${hasCompleteData ? 'flex flex-col justify-center items-center text-center' : ''}`}
        style={{ 
          padding: `${config.padding}px`,
          fontSize: `${config.fontSize}px`,
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div className="w-full max-w-full h-full flex flex-col justify-between overflow-hidden">
          <div className="border-b-2 border-gray-400 pb-2 w-full mb-2 overflow-hidden">
            <span className="font-bold block mb-1" style={{ fontSize: `${config.fontSize - 1}px` }}>
              PRODUTO:
            </span>
            <div 
              className="border-b border-gray-300 pb-1 word-wrap break-words overflow-hidden font-bold text-black uppercase"
              style={{ 
                fontSize: `${config.fontSize}px`,
                maxHeight: config.compactMode ? '16px' : '24px'
              }}
            >
              {product.nome || ''}
            </div>
          </div>

          <div className={`${config.showGrid ? 'grid grid-cols-2 gap-2' : 'space-y-2'} w-full`}>
            <div className="overflow-hidden">
              <span className="font-bold block mb-1" style={{ fontSize: `${config.fontSize - 1}px` }}>
                LOTE:
              </span>
              <div 
                className="border-b border-gray-300 pb-1 overflow-hidden font-bold text-black uppercase"
                style={{ fontSize: `${config.fontSize}px` }}
              >
                {product.lote || ''}
              </div>
            </div>
            <div className="overflow-hidden">
              <span className="font-bold block mb-1" style={{ fontSize: `${config.fontSize - 1}px` }}>
                MARCA:
              </span>
              <div 
                className="border-b border-gray-300 pb-1 overflow-hidden font-bold text-black uppercase"
                style={{ fontSize: `${config.fontSize}px` }}
              >
                {product.marca || ''}
              </div>
            </div>
          </div>

          {showOptionalDates && !config.compactMode && (
            <div className={`${config.showGrid ? 'grid grid-cols-2 gap-2' : 'space-y-2'} w-full mt-2`}>
              <div className="overflow-hidden">
                <span className="font-bold block mb-1" style={{ fontSize: `${config.fontSize - 1}px` }}>
                  FAB.:
                </span>
                <div 
                  className="border-b border-gray-300 pb-1 overflow-hidden font-bold text-black"
                  style={{ fontSize: `${config.fontSize}px` }}
                >
                  {formatDate(product.dataFabricacao) || ''}
                </div>
              </div>
              <div className="overflow-hidden">
                <span className="font-bold block mb-1" style={{ fontSize: `${config.fontSize - 1}px` }}>
                  VAL.:
                </span>
                <div 
                  className="border-b border-gray-300 pb-1 overflow-hidden font-bold text-black"
                  style={{ fontSize: `${config.fontSize}px` }}
                >
                  {formatDate(product.validade) || ''}
                </div>
              </div>
            </div>
          )}

          <div className={`${config.showGrid ? 'grid grid-cols-2 gap-2' : 'space-y-2'} w-full mt-2`}>
            <div className="overflow-hidden">
              <span className="font-bold block mb-1" style={{ fontSize: `${config.fontSize - 1}px` }}>
                ABERTURA:
              </span>
              <div 
                className="border-b border-gray-300 pb-1 overflow-hidden font-bold text-black"
                style={{ fontSize: `${config.fontSize}px` }}
              >
                {formatDate(product.dataAbertura) || ''}
              </div>
            </div>
            <div className="overflow-hidden">
              <span className="font-bold block mb-1" style={{ fontSize: `${config.fontSize - 1}px` }}>
                USAR ATÉ:
              </span>
              <div 
                className="border-b border-gray-300 pb-1 overflow-hidden font-bold text-black"
                style={{ fontSize: `${config.fontSize}px` }}
              >
                {formatDate(product.utilizarAte) || ''}
              </div>
            </div>
          </div>

          <div 
            className={`${config.compactMode ? 'flex justify-between' : 'grid grid-cols-3 gap-1'} pt-2 w-full mt-2`}
            style={{ fontSize: `${config.fontSize - 1}px` }}
          >
            <label className="flex items-center space-x-1 justify-center">
              <input 
                type="checkbox" 
                checked={product.localArmazenamento === 'refrigerado'}
                readOnly
                className="flex-shrink-0"
                style={{ width: '12px', height: '12px' }}
              />
              <span className="font-bold text-black">
                {config.compactMode ? 'REF' : 'REFRIG.'}
              </span>
            </label>
            <label className="flex items-center space-x-1 justify-center">
              <input 
                type="checkbox" 
                checked={product.localArmazenamento === 'congelado'}
                readOnly
                className="flex-shrink-0"
                style={{ width: '12px', height: '12px' }}
              />
              <span className="font-bold text-black">
                {config.compactMode ? 'CON' : 'CONGEL.'}
              </span>
            </label>
            <label className="flex items-center space-x-1 justify-center">
              <input 
                type="checkbox" 
                checked={product.localArmazenamento === 'ambiente'}
                readOnly
                className="flex-shrink-0"
                style={{ width: '12px', height: '12px' }}
              />
              <span className="font-bold text-black">
                {config.compactMode ? 'AMB' : 'AMBIENT.'}
              </span>
            </label>
          </div>

          {!config.compactMode && (
            <div className="border-t-2 border-gray-400 pt-2 w-full mt-2 overflow-hidden">
              <span className="font-bold block mb-1" style={{ fontSize: `${config.fontSize - 1}px` }}>
                RESPONSÁVEL:
              </span>
              <div 
                className="border-b border-gray-300 pb-1 overflow-hidden font-bold text-black uppercase"
                style={{ fontSize: `${config.fontSize}px` }}
              >
                {product.responsavel || ''}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
