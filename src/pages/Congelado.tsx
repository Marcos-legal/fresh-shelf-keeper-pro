import { PageLayout } from "@/components/PageLayout";
import { ProductTable } from "@/components/ProductTable";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Snowflake } from "lucide-react";

const Congelado = () => {
  const { products, updateDataAbertura, deleteProduct } = useProductsSupabase();
  const congeladoProducts = products.filter(product => product.localArmazenamento === 'congelado');

  const handlePrintLabel = (product: any) => {
    console.log("Imprimindo etiqueta:", product);
  };

  return (
    <PageLayout title="Produtos Congelados" description="Controle de produtos armazenados sob congelamento" icon={Snowflake}>
      <ProductTable products={congeladoProducts} onEdit={() => {}} onDelete={deleteProduct}
        onUpdateAbertura={updateDataAbertura} onPrintLabel={handlePrintLabel} title="Produtos Congelados" category="congelado" />
    </PageLayout>
  );
};

export default Congelado;
