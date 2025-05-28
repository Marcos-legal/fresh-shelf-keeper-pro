
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";

interface EtiquetaViewProps {
  product: Product;
}

export function EtiquetaView({ product }: EtiquetaViewProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return '__/__/__';
    
    try {
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '__/__/__';
      }
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return '__/__/__';
    }
  };

  return (
    <Card className="w-80 border-2 border-gray-400 bg-white">
      <CardContent className="p-4 space-y-3 font-mono text-sm">
        <div className="border-b border-gray-400 pb-1">
          <span className="font-bold">Nome do Produto:</span>
          <div className="border-b border-gray-300 mt-1 pb-1">
            {product.nome || '_____________________'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold">Lote nº:</span>
            <div className="border-b border-gray-300 mt-1 pb-1">
              {product.lote || '__________'}
            </div>
          </div>
          <div>
            <span className="font-bold">Marca:</span>
            <div className="border-b border-gray-300 mt-1 pb-1">
              {product.marca || '__________'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold">Fab.:</span>
            <div className="border-b border-gray-300 mt-1 pb-1">
              {formatDate(product.dataFabricacao)}
            </div>
          </div>
          <div>
            <span className="font-bold">Val.:</span>
            <div className="border-b border-gray-300 mt-1 pb-1">
              {formatDate(product.validade)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold">DT Abert:</span>
            <div className="border-b border-gray-300 mt-1 pb-1">
              {formatDate(product.dataAbertura)}
            </div>
          </div>
          <div>
            <span className="font-bold">Utilizar até:</span>
            <div className="border-b border-gray-300 mt-1 pb-1">
              {formatDate(product.utilizarAte)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
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
          <label className="flex items-center space-x-1">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'camara-fria'}
              readOnly
              className="w-3 h-3"
            />
            <span className="font-bold">Câmara Fria</span>
          </label>
        </div>

        <div className="border-b border-gray-400 pb-1">
          <span className="font-bold">Responsável:</span>
          <div className="border-b border-gray-300 mt-1 pb-1">
            {product.responsavel || '_____________________'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
