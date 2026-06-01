import { Product } from "@/types/product";
import { EtiquetaView } from "./EtiquetaView";

interface EtiquetaPreviewProps {
  product: Product;
  largura?: number;
  altura?: number;
}

/**
 * Preview da etiqueta. Usa o mesmo componente da impressão para garantir
 * 100% de fidelidade entre o que o usuário vê e o que é impresso.
 */
export function EtiquetaPreview({ product, largura = 52, altura = 50 }: EtiquetaPreviewProps) {
  return <EtiquetaView product={product} largura={largura} altura={altura} />;
}
