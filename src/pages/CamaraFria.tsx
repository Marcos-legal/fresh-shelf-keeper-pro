import { PageLayout } from "@/components/PageLayout";
import { ProductTable } from "@/components/ProductTable";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Refrigerator } from "lucide-react";

const CamaraFria = () => {
  const { products, updateDataAbertura, deleteProduct } = useProductsSupabase();
  const camaraFriaProducts = products.filter(product => product.localArmazenamento === 'camara-fria');

  const handlePrintLabel = (product: any) => {
  };

  return (
    <PageLayout title="Produtos Câmara Fria" description="Controle de produtos armazenados em câmara fria" icon={Refrigerator}>
      <ProductTable products={camaraFriaProducts} onEdit={() => {}} onDelete={deleteProduct}
        onUpdateAbertura={updateDataAbertura} onPrintLabel={handlePrintLabel} title="Produtos Câmara Fria" category="camara-fria" />
    </PageLayout>
  );
};

export default CamaraFria;
