
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
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
      toast({
        title: "Produto cadastrado",
        description: "O produto foi cadastrado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao cadastrar o produto.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MobileDrawer />
        <AppSidebar />
        <main className="flex-1">
          <div className="p-4 lg:p-6">
            <div className="flex items-center space-x-4 mb-8">
              <SidebarTrigger className="hidden lg:flex" />
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Cadastro de Produtos
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Adicione novos produtos ao sistema
                  </p>
                </div>
              </div>
            </div>

            <ProductForm
              onSubmit={handleAddProduct}
              title="Cadastrar Novo Produto"
              submitLabel="Cadastrar Produto"
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Cadastro;
