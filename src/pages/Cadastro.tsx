import { PageLayout } from "@/components/PageLayout";
import { ProductForm } from "@/components/ProductForm";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProductFormData } from "@/types/product";

const Cadastro = () => {
  const { addProduct } = useProductsSupabase();

  const handleAddProduct = (data: ProductFormData) => {
    try {
      addProduct(data);
      toast({ title: "Produto cadastrado", description: "O produto foi cadastrado com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao cadastrar", description: "Ocorreu um erro ao cadastrar o produto.", variant: "destructive" });
    }
  };

  return (
    <PageLayout 
      title="Cadastro de Produtos" 
      description="Adicione novos produtos ao sistema"
      icon={Package}
    >
      <ProductForm onSubmit={handleAddProduct} title="Cadastrar Novo Produto" submitLabel="Cadastrar Produto" />
    </PageLayout>
  );
};

export default Cadastro;
