
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";

interface EtiquetaViewProps {
  product: Product;
}

export function EtiquetaView({ product }: EtiquetaViewProps) {
  // Usar a configuração individual do produto
  const showOptionalDates = product.showOptionalDates ?? false;

  const formatDate = (date: Date | undefined | string) => {
    if (!date) return '';
    
    try {
      // Handle string formats like "DEZEMBRO/2025" or "31/12/2025"
      if (typeof date === 'string') {
        if (date.includes('/')) {
          // Handle formats like "DEZEMBRO/2025" or "31/12/2025" or "12/2025"
          if (date.match(/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]+\/\d{4}$/)) {
            // Format: DEZEMBRO/2025
            return date;
          } else if (date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            // Format: 31/12/2025
            return date;
          } else if (date.match(/^\d{1,2}\/\d{4}$/)) {
            // Format: 12/2025
            return date;
          }
        } else {
          // Handle YYYY-MM-DD format
          const [year, month, day] = date.split('-').map(Number);
          if (year && month && day) {
            const dateObj = new Date(year, month - 1, day);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toLocaleDateString('pt-BR');
            }
          }
        }
      }
      
      // Handle Date objects
      if (date instanceof Date) {
        if (isNaN(date.getTime())) {
          return '';
        }
        return date.toLocaleDateString('pt-BR');
      }
      
      // Return the original value if it's already formatted
      return String(date);
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return '';
    }
  };

  return (
    <Card className="w-80 border-2 border-gray-400 bg-white overflow-hidden">
      <CardContent className="p-3 space-y-2 font-mono text-xs">
        <div className="border-b border-gray-400 pb-1">
          <span className="font-bold text-xs">Nome do Produto:</span>
          <div className="border-b border-gray-300 mt-1 pb-1 min-h-[18px] text-xs">
            {product.nome || ''}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-bold text-xs">Lote nº:</span>
            <div className="border-b border-gray-300 mt-1 pb-1 min-h-[16px] text-xs">
              {product.lote || ''}
            </div>
          </div>
          <div>
            <span className="font-bold text-xs">Marca:</span>
            <div className="border-b border-gray-300 mt-1 pb-1 min-h-[16px] text-xs">
              {product.marca || ''}
            </div>
          </div>
        </div>

        {showOptionalDates && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-bold text-xs">Fab.:</span>
              <div className="border-b border-gray-300 mt-1 pb-1 min-h-[16px] text-xs">
                {formatDate(product.dataFabricacao) || ''}
              </div>
            </div>
            <div>
              <span className="font-bold text-xs">Val.:</span>
              <div className="border-b border-gray-300 mt-1 pb-1 min-h-[16px] text-xs">
                {formatDate(product.validade) || ''}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-bold text-xs">DT Abert:</span>
            <div className="border-b border-gray-300 mt-1 pb-1 min-h-[16px] text-xs">
              {formatDate(product.dataAbertura) || ''}
            </div>
          </div>
          <div>
            <span className="font-bold text-xs">Utilizar até:</span>
            <div className="border-b border-gray-300 mt-1 pb-1 min-h-[16px] text-xs">
              {formatDate(product.utilizarAte) || ''}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 text-xs pt-1">
          <label className="flex items-center space-x-1">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'refrigerado'}
              readOnly
              className="w-2 h-2"
            />
            <span className="font-bold text-xs">Refrig.</span>
          </label>
          <label className="flex items-center space-x-1">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'congelado'}
              readOnly
              className="w-2 h-2"
            />
            <span className="font-bold text-xs">Congel.</span>
          </label>
          <label className="flex items-center space-x-1">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'ambiente'}
              readOnly
              className="w-2 h-2"
            />
            <span className="font-bold text-xs">Ambient.</span>
          </label>
        </div>

        <div className="border-b border-gray-400 pb-1 pt-1">
          <span className="font-bold text-xs">Responsável:</span>
          <div className="border-b border-gray-300 mt-1 pb-1 min-h-[16px] text-xs">
            {product.responsavel || ''}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
