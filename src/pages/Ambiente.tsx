
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProductTable } from "@/components/ProductTable";
import { useProducts } from "@/hooks/useProducts";
import { Home } from "lucide-react";

const Ambiente = () => {
  const { products, updateDataAbertura, deleteProduct } = useProducts();
  
  const ambienteProducts = products.filter(product => product.localArmazenamento === 'ambiente');

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
                <Home className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Produtos Ambiente
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Controle de produtos armazenados em temperatura ambiente
                  </p>
                </div>
              </div>
            </div>

            <ProductTable
              products={ambienteProducts}
              onEdit={() => {}}
              onDelete={deleteProduct}
              onUpdateAbertura={updateDataAbertura}
              onPrintLabel={handlePrintLabel}
              title="Produtos Ambiente"
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Ambiente;
