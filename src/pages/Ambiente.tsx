import { PageLayout } from "@/components/PageLayout";
import { ProductTable } from "@/components/ProductTable";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Home } from "lucide-react";

const Ambiente = () => {
  const { products, updateDataAbertura, deleteProduct } = useProductsSupabase();
  const ambienteProducts = products.filter(product => product.localArmazenamento === 'ambiente');

  const handlePrintLabel = (product: any) => {
    console.log("Imprimindo etiqueta:", product);
  };

  return (
    <PageLayout title="Produtos Ambiente" description="Controle de produtos armazenados em temperatura ambiente" icon={Home}>
      <ProductTable products={ambienteProducts} onEdit={() => {}} onDelete={deleteProduct}
        onUpdateAbertura={updateDataAbertura} onPrintLabel={handlePrintLabel} title="Produtos Ambiente" category="ambiente" />
    </PageLayout>
  );
};

export default Ambiente;
