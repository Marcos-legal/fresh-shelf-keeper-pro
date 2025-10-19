
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
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
              <SidebarTrigger className="hidden lg:flex" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Cadastro de Produtos
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
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
