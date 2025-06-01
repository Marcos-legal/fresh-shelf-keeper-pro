
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
    <Card className="w-80 border-2 border-gray-400 bg-white">
      <CardContent className="p-4 space-y-3 font-mono text-sm">
        <div className="border-b border-gray-400 pb-1">
          <span className="font-bold">Nome do Produto:</span>
          <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
            {product.nome || ''}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold">Lote nº:</span>
            <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
              {product.lote || ''}
            </div>
          </div>
          <div>
            <span className="font-bold">Marca:</span>
            <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
              {product.marca || ''}
            </div>
          </div>
        </div>

        {showOptionalDates && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-bold">Fab.:</span>
              <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
                {formatDate(product.dataFabricacao)}
              </div>
            </div>
            <div>
              <span className="font-bold">Val.:</span>
              <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
                {formatDate(product.validade)}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold">DT Abert:</span>
            <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
              {formatDate(product.dataAbertura)}
            </div>
          </div>
          <div>
            <span className="font-bold">Utilizar até:</span>
            <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
              {formatDate(product.utilizarAte)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <label className="flex items-center space-x-1">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'refrigerado'}
              readOnly
              className="w-3 h-3"
            />
            <span className="font-bold">Refrigerado</span>
          </label>
          <label className="flex items-center space-x-1">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'congelado'}
              readOnly
              className="w-3 h-3"
            />
            <span className="font-bold">Congelado</span>
          </label>
          <label className="flex items-center space-x-1">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'ambiente'}
              readOnly
              className="w-3 h-3"
            />
            <span className="font-bold">Ambiente</span>
          </label>
        </div>

        <div className="border-b border-gray-400 pb-1">
          <span className="font-bold">Responsável:</span>
          <div className="border-b border-gray-300 mt-1 pb-1 min-h-[20px]">
            {product.responsavel || ''}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
