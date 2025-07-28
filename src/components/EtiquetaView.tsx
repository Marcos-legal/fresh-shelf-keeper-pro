
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
    const widthPx = Math.max(280, largura * 4); // Conversão aproximada mm para px
    const heightPx = Math.max(200, altura * 4);
    
    // Calcular fontSize baseado na menor dimensão para manter proporções
    const minDimension = Math.min(widthPx, heightPx);
    const fontSize = Math.max(8, Math.min(16, Math.floor(minDimension / 25)));
    
    // Calcular padding e spacing proporcionalmente
    const padding = Math.max(8, Math.floor(fontSize * 1.2));
    const spacing = Math.max(2, Math.floor(fontSize * 0.3));

    return {
      width: widthPx,
      height: heightPx,
      fontSize,
      padding,
      spacing
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
        <div className="w-full h-full flex flex-col justify-between" style={{ gap: `${config.spacing}px` }}>
          {/* Nome do Produto - 2 linhas como na imagem */}
          <div className="w-full">
            <div className="flex items-baseline mb-1">
              <span className="font-bold mr-2" style={{ fontSize: `${config.fontSize}px` }}>
                Nome do Produto:
              </span>
              <div 
                className="flex-1 border-b border-black"
                style={{ height: `${config.fontSize + 2}px`, position: 'relative' }}
              >
                <span 
                  className="absolute left-0 top-0 font-bold text-black uppercase"
                  style={{ fontSize: `${config.fontSize - 1}px` }}
                >
                  {product.nome || ''}
                </span>
              </div>
            </div>
            <div 
              className="w-full border-b border-black"
              style={{ height: `${config.fontSize + 2}px` }}
            >
            </div>
          </div>

          {/* Lote e Marca na mesma linha */}
          <div className="w-full flex gap-4">
            <div className="flex items-baseline flex-1">
              <span className="font-bold mr-2" style={{ fontSize: `${config.fontSize}px` }}>
                Lote nº:
              </span>
              <div 
                className="flex-1 border-b border-black"
                style={{ height: `${config.fontSize + 2}px`, position: 'relative' }}
              >
                <span 
                  className="absolute left-0 top-0 font-bold text-black uppercase"
                  style={{ fontSize: `${config.fontSize - 1}px` }}
                >
                  {product.lote || ''}
                </span>
              </div>
            </div>
            <div className="flex items-baseline flex-1">
              <span className="font-bold mr-2" style={{ fontSize: `${config.fontSize}px` }}>
                Marca:
              </span>
              <div 
                className="flex-1 border-b border-black"
                style={{ height: `${config.fontSize + 2}px`, position: 'relative' }}
              >
                <span 
                  className="absolute left-0 top-0 font-bold text-black uppercase"
                  style={{ fontSize: `${config.fontSize - 1}px` }}
                >
                  {product.marca || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Fab. e Val. na mesma linha */}
          <div className="w-full flex gap-4">
            <div className="flex items-baseline flex-1">
              <span className="font-bold mr-2" style={{ fontSize: `${config.fontSize}px` }}>
                Fab.:
              </span>
              <div 
                className="flex-1 border-b border-black"
                style={{ height: `${config.fontSize + 2}px`, position: 'relative' }}
              >
                <span 
                  className="absolute left-0 top-0 font-bold text-black"
                  style={{ fontSize: `${config.fontSize - 1}px` }}
                >
                  {formatDate(product.dataFabricacao) || ''}
                </span>
              </div>
            </div>
            <div className="flex items-baseline flex-1">
              <span className="font-bold mr-2" style={{ fontSize: `${config.fontSize}px` }}>
                Val.:
              </span>
              <div 
                className="flex-1 border-b border-black"
                style={{ height: `${config.fontSize + 2}px`, position: 'relative' }}
              >
                <span 
                  className="absolute left-0 top-0 font-bold text-black"
                  style={{ fontSize: `${config.fontSize - 1}px` }}
                >
                  {formatDate(product.validade) || ''}
                </span>
              </div>
            </div>
          </div>

          {/* DT Abert. e Utilizar até na mesma linha */}
          <div className="w-full flex gap-4">
            <div className="flex items-baseline flex-1">
              <span className="font-bold mr-2" style={{ fontSize: `${config.fontSize}px` }}>
                DT Abert:
              </span>
              <div 
                className="flex-1 border-b border-black"
                style={{ height: `${config.fontSize + 2}px`, position: 'relative' }}
              >
                <span 
                  className="absolute left-0 top-0 font-bold text-black"
                  style={{ fontSize: `${config.fontSize - 1}px` }}
                >
                  {formatDate(product.dataAbertura) || ''}
                </span>
              </div>
            </div>
            <div className="flex items-baseline flex-1">
              <span className="font-bold mr-2" style={{ fontSize: `${config.fontSize}px` }}>
                Utilizar até:
              </span>
              <div 
                className="flex-1 border-b border-black"
                style={{ height: `${config.fontSize + 2}px`, position: 'relative' }}
              >
                <span 
                  className="absolute left-0 top-0 font-bold text-black"
                  style={{ fontSize: `${config.fontSize - 1}px` }}
                >
                  {formatDate(product.utilizarAte) || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div 
            className="w-full flex justify-start gap-6 items-center"
            style={{ fontSize: `${config.fontSize}px` }}
          >
            <label className="flex items-center gap-2">
              <div 
                className="border-2 border-black flex items-center justify-center"
                style={{ width: '16px', height: '16px' }}
              >
                {product.localArmazenamento === 'refrigerado' && (
                  <span className="text-black font-bold">✓</span>
                )}
              </div>
              <span className="font-bold text-black">Refrigerado</span>
            </label>
            <label className="flex items-center gap-2">
              <div 
                className="border-2 border-black flex items-center justify-center"
                style={{ width: '16px', height: '16px' }}
              >
                {product.localArmazenamento === 'congelado' && (
                  <span className="text-black font-bold">✓</span>
                )}
              </div>
              <span className="font-bold text-black">Congelado</span>
            </label>
            <label className="flex items-center gap-2">
              <div 
                className="border-2 border-black flex items-center justify-center"
                style={{ width: '16px', height: '16px' }}
              >
                {product.localArmazenamento === 'ambiente' && (
                  <span className="text-black font-bold">✓</span>
                )}
              </div>
              <span className="font-bold text-black">Ambiente</span>
            </label>
          </div>

          {/* Responsável */}
          <div className="w-full">
            <div className="flex items-baseline">
              <span className="font-bold mr-2" style={{ fontSize: `${config.fontSize}px` }}>
                Responsável:
              </span>
              <div 
                className="flex-1 border-b border-black"
                style={{ height: `${config.fontSize + 2}px`, position: 'relative' }}
              >
                <span 
                  className="absolute left-0 top-0 font-bold text-black uppercase"
                  style={{ fontSize: `${config.fontSize - 1}px` }}
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
