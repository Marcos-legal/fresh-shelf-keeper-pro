import { PageLayout } from "@/components/PageLayout";
import { ProductTable } from "@/components/ProductTable";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Thermometer } from "lucide-react";

const Refrigerado = () => {
  const { products, updateDataAbertura, deleteProduct } = useProductsSupabase();
  const refrigeradoProducts = products.filter(product => product.localArmazenamento === 'refrigerado');

  const handlePrintLabel = (product: any) => {
    console.log("Imprimindo etiqueta:", product);
  };

  return (
    <PageLayout 
      title="Produtos Refrigerados" 
      description="Controle de produtos armazenados sob refrigeração"
      icon={Thermometer}
      iconClassName="bg-primary/10 text-primary"
    >
      <ProductTable
        products={refrigeradoProducts}
        onEdit={() => {}}
        onDelete={deleteProduct}
        onUpdateAbertura={updateDataAbertura}
        onPrintLabel={handlePrintLabel}
        title="Produtos Refrigerados"
        category="refrigerado"
      />
    </PageLayout>
  );
};

export default Refrigerado;
