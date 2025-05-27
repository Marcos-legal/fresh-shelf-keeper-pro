
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { FileText, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Relatorios = () => {
  const { products, stats } = useProducts();

  const handleDownloadReport = (type: string) => {
    console.log(`Baixando relatório: ${type}`);
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
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Relatórios
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Visualize e exporte relatórios do sistema
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Relatório Geral</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Relatório completo com todos os produtos cadastrados
                  </p>
                  <Button 
                    onClick={() => handleDownloadReport('geral')}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Produtos Vencidos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Lista de produtos com data de validade expirada
                  </p>
                  <Button 
                    onClick={() => handleDownloadReport('vencidos')}
                    className="w-full"
                    variant="destructive"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Próximos ao Vencimento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Produtos que vencem nos próximos dias
                  </p>
                  <Button 
                    onClick={() => handleDownloadReport('proximo-vencimento')}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Relatório
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Estatístico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                      <p className="text-sm text-gray-600">Total de Produtos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.validos}</p>
                      <p className="text-sm text-gray-600">Produtos Válidos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{stats.proximoVencimento}</p>
                      <p className="text-sm text-gray-600">Próximo Vencimento</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{stats.vencidos}</p>
                      <p className="text-sm text-gray-600">Produtos Vencidos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Relatorios;
