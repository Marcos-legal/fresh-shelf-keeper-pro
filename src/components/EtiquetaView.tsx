
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";

interface EtiquetaViewProps {
  product: Product;
}

export function EtiquetaView({ product }: EtiquetaViewProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
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
              {product.dataFabricacao ? formatDate(product.dataFabricacao) : '__/__/__'}
            </div>
          </div>
          <div>
            <span className="font-bold">Val.:</span>
            <div className="border-b border-gray-300 mt-1 pb-1">
              {product.validade ? formatDate(product.validade) : '__/__/__'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold">DT Abert:</span>
            <div className="border-b border-gray-300 mt-1 pb-1">
              {product.dataAbertura ? formatDate(product.dataAbertura) : '__/__/__'}
            </div>
          </div>
          <div>
            <span className="font-bold">Utilizar até:</span>
            <div className="border-b border-gray-300 mt-1 pb-1">
              {product.utilizarAte ? formatDate(product.utilizarAte) : '__/__/__'}
            </div>
          </div>
        </div>

        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'refrigerado'}
              readOnly
              className="w-4 h-4"
            />
            <span className="font-bold">Refrigerado</span>
          </label>
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'congelado'}
              readOnly
              className="w-4 h-4"
            />
            <span className="font-bold">Congelado</span>
          </label>
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={product.localArmazenamento === 'ambiente'}
              readOnly
              className="w-4 h-4"
            />
            <span className="font-bold">Ambiente</span>
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
