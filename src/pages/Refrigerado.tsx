
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MobileDrawer />
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
              <SidebarTrigger className="hidden lg:flex" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Thermometer className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                    Produtos Refrigerados
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-0.5 sm:mt-1">
                    Controle de produtos armazenados sob refrigeração
                  </p>
                </div>
              </div>
            </div>

            <ProductTable
              products={refrigeradoProducts}
              onEdit={() => {}}
              onDelete={deleteProduct}
              onUpdateAbertura={updateDataAbertura}
              onPrintLabel={handlePrintLabel}
              title="Produtos Refrigerados"
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Refrigerado;
