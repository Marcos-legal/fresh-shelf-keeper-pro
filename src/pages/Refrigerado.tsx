
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-8">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center space-x-3">
                <Thermometer className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Produtos Refrigerados
                  </h1>
                  <p className="text-gray-600 mt-1">
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
