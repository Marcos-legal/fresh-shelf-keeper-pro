
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MobileDrawer />
        <AppSidebar />
        <main className="flex-1">
          <div className="p-4 lg:p-6">
            <div className="flex items-center space-x-4 mb-8">
              <SidebarTrigger className="hidden lg:flex" />
              <div className="flex items-center space-x-3">
                <Snowflake className="w-8 h-8 text-cyan-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Produtos Congelados
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Controle de produtos armazenados sob congelamento
                  </p>
                </div>
              </div>
            </div>

            <ProductTable
              products={congeladoProducts}
              onEdit={() => {}}
              onDelete={deleteProduct}
              onUpdateAbertura={updateDataAbertura}
              onPrintLabel={handlePrintLabel}
              title="Produtos Congelados"
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Congelado;
