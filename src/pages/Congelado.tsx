
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
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 pt-14 sm:pt-4 md:pt-6 lg:pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4 mb-4 sm:mb-6 md:mb-8">
              <SidebarTrigger className="hidden lg:flex" />
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                    Produtos Congelados
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-0.5 sm:mt-1">
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
