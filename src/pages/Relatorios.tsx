
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { FileText, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Relatorios = () => {
  const { products, stats } = useProducts();

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há produtos que atendem aos critérios selecionados.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'Nome',
      'Lote', 
      'Marca',
      'Data Fabricação',
      'Validade',
      'Data Abertura',
      'Utilizar Até',
      'Dias Para Vencer',
      'Local Armazenamento',
      'Responsável',
      'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(product => [
        `"${product.nome}"`,
        `"${product.lote}"`,
        `"${product.marca}"`,
        product.dataFabricacao ? product.dataFabricacao.toLocaleDateString('pt-BR') : '',
        product.validade ? product.validade.toLocaleDateString('pt-BR') : '',
        product.dataAbertura ? product.dataAbertura.toLocaleDateString('pt-BR') : '',
        product.utilizarAte ? product.utilizarAte.toLocaleDateString('pt-BR') : '',
        product.diasParaVencer,
        `"${product.localArmazenamento}"`,
        `"${product.responsavel}"`,
        `"${product.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Relatório baixado",
      description: `Arquivo ${filename}.csv foi baixado com sucesso!`,
    });
  };

  const handleDownloadReport = (type: string) => {
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0];

    switch (type) {
      case 'geral':
        downloadCSV(products, `relatorio-geral-${timestamp}`);
        break;
      case 'vencidos':
        const vencidos = products.filter(p => p.status === 'vencido');
        downloadCSV(vencidos, `produtos-vencidos-${timestamp}`);
        break;
      case 'proximo-vencimento':
        const proximoVencimento = products.filter(p => p.status === 'proximo-vencimento');
        downloadCSV(proximoVencimento, `proximo-vencimento-${timestamp}`);
        break;
      default:
        console.log(`Relatório não implementado: ${type}`);
    }
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
                    Relatório completo com todos os produtos cadastrados ({products.length} produtos)
                  </p>
                  <Button 
                    onClick={() => handleDownloadReport('geral')}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar CSV
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
                    Lista de produtos com data de validade expirada ({stats.vencidos} produtos)
                  </p>
                  <Button 
                    onClick={() => handleDownloadReport('vencidos')}
                    className="w-full"
                    variant="destructive"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar CSV
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
                    Produtos que vencem nos próximos dias ({stats.proximoVencimento} produtos)
                  </p>
                  <Button 
                    onClick={() => handleDownloadReport('proximo-vencimento')}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar CSV
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
