
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";

interface EtiquetaViewProps {
  product: Product;
}

export function EtiquetaView({ product }: EtiquetaViewProps) {
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

  const hasCompleteData = product.nome && product.lote && product.marca && 
    product.dataAbertura && product.utilizarAte && product.responsavel;

  return (
    <Card className="w-80 border-2 border-gray-400 bg-white overflow-hidden">
      <CardContent className={`p-4 font-mono text-xs ${hasCompleteData ? 'flex flex-col justify-center items-center text-center min-h-[300px]' : ''}`}>
        <div className="w-full max-w-full space-y-3">
          <div className="border-b-2 border-gray-400 pb-2 w-full">
            <span className="font-bold text-xs block mb-1">Nome do Produto:</span>
            <div className="border-b border-gray-300 pb-1 min-h-[20px] text-xs word-wrap break-words overflow-hidden">
              {product.nome || ''}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <div>
              <span className="font-bold text-xs block mb-1">Lote nº:</span>
              <div className="border-b border-gray-300 pb-1 min-h-[18px] text-xs overflow-hidden">
                {product.lote || ''}
              </div>
            </div>
            <div>
              <span className="font-bold text-xs block mb-1">Marca:</span>
              <div className="border-b border-gray-300 pb-1 min-h-[18px] text-xs overflow-hidden">
                {product.marca || ''}
              </div>
            </div>
          </div>

          {showOptionalDates && (
            <div className="grid grid-cols-2 gap-3 w-full">
              <div>
                <span className="font-bold text-xs block mb-1">Fab.:</span>
                <div className="border-b border-gray-300 pb-1 min-h-[18px] text-xs overflow-hidden">
                  {formatDate(product.dataFabricacao) || ''}
                </div>
              </div>
              <div>
                <span className="font-bold text-xs block mb-1">Val.:</span>
                <div className="border-b border-gray-300 pb-1 min-h-[18px] text-xs overflow-hidden">
                  {formatDate(product.validade) || ''}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 w-full">
            <div>
              <span className="font-bold text-xs block mb-1">DT Abert:</span>
              <div className="border-b border-gray-300 pb-1 min-h-[18px] text-xs overflow-hidden">
                {formatDate(product.dataAbertura) || ''}
              </div>
            </div>
            <div>
              <span className="font-bold text-xs block mb-1">Utilizar até:</span>
              <div className="border-b border-gray-300 pb-1 min-h-[18px] text-xs overflow-hidden">
                {formatDate(product.utilizarAte) || ''}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-2 w-full">
            <label className="flex items-center space-x-1 justify-center">
              <input 
                type="checkbox" 
                checked={product.localArmazenamento === 'refrigerado'}
                readOnly
                className="w-3 h-3 flex-shrink-0"
              />
              <span className="font-bold text-xs">Refrig.</span>
            </label>
            <label className="flex items-center space-x-1 justify-center">
              <input 
                type="checkbox" 
                checked={product.localArmazenamento === 'congelado'}
                readOnly
                className="w-3 h-3 flex-shrink-0"
              />
              <span className="font-bold text-xs">Congel.</span>
            </label>
            <label className="flex items-center space-x-1 justify-center">
              <input 
                type="checkbox" 
                checked={product.localArmazenamento === 'ambiente'}
                readOnly
                className="w-3 h-3 flex-shrink-0"
              />
              <span className="font-bold text-xs">Ambient.</span>
            </label>
          </div>

          <div className="border-t-2 border-gray-400 pt-2 w-full">
            <span className="font-bold text-xs block mb-1">Responsável:</span>
            <div className="border-b border-gray-300 pb-1 min-h-[18px] text-xs overflow-hidden">
              {product.responsavel || ''}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

