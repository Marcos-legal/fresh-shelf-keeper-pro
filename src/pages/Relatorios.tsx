
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { FileText, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Relatorios = () => {
  const { products, stats } = useProducts();

  const formatDateForExport = (date: Date | undefined) => {
    if (!date) return '';
    try {
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valido': return 'VÁLIDO';
      case 'proximo-vencimento': return 'PRÓXIMO AO VENCIMENTO';
      case 'vencido': return 'VENCIDO';
      default: return status.toUpperCase();
    }
  };

  const getLocalArmazenamentoText = (local: string) => {
    switch (local) {
      case 'refrigerado': return 'REFRIGERADO';
      case 'congelado': return 'CONGELADO';
      case 'ambiente': return 'AMBIENTE';
      case 'camara-fria': return 'CÂMARA FRIA';
      default: return local.toUpperCase();
    }
  };

  const downloadCSV = (data: any[], filename: string, reportType: string) => {
    if (data.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há produtos que atendem aos critérios selecionados.",
        variant: "destructive",
      });
      return;
    }

    // Cabeçalho do relatório
    const reportHeader = [
      `RELATÓRIO: ${reportType.toUpperCase()}`,
      `DATA DE GERAÇÃO: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      `TOTAL DE PRODUTOS: ${data.length}`,
      '', // Linha em branco
      '='.repeat(100), // Separador
      ''
    ];

    // Cabeçalhos das colunas
    const headers = [
      'NOME DO PRODUTO',
      'LOTE', 
      'MARCA',
      'DATA FABRICAÇÃO',
      'DATA VALIDADE',
      'DATA ABERTURA',
      'UTILIZAR ATÉ',
      'DIAS PARA VENCER',
      'LOCAL ARMAZENAMENTO',
      'RESPONSÁVEL',
      'STATUS'
    ];

    // Dados dos produtos
    const csvData = data.map(product => [
      `"${(product.nome || '').toUpperCase()}"`,
      `"${(product.lote || '').toUpperCase()}"`,
      `"${(product.marca || '').toUpperCase()}"`,
      `"${formatDateForExport(product.dataFabricacao)}"`,
      `"${formatDateForExport(product.validade)}"`,
      `"${formatDateForExport(product.dataAbertura)}"`,
      `"${formatDateForExport(product.utilizarAte)}"`,
      `"${product.diasParaVencer || 0}"`,
      `"${getLocalArmazenamentoText(product.localArmazenamento)}"`,
      `"${(product.responsavel || '').toUpperCase()}"`,
      `"${getStatusText(product.status)}"`
    ]);

    // Rodapé com estatísticas
    const footer = [
      '',
      '='.repeat(100),
      'RESUMO ESTATÍSTICO:',
      `PRODUTOS VÁLIDOS: ${stats.validos}`,
      `PRÓXIMOS AO VENCIMENTO: ${stats.proximoVencimento}`,
      `PRODUTOS VENCIDOS: ${stats.vencidos}`,
      '',
      'PRODUTOS POR LOCAL DE ARMAZENAMENTO:',
      `REFRIGERADO: ${stats.porCategoria.refrigerado}`,
      `CONGELADO: ${stats.porCategoria.congelado}`,
      `AMBIENTE: ${stats.porCategoria.ambiente}`,
      `CÂMARA FRIA: ${stats.porCategoria['camara-fria']}`,
      '',
      `Relatório gerado pelo Sistema de Controle de Validade - ${new Date().getFullYear()}`
    ];

    // Combinar tudo
    const csvContent = [
      ...reportHeader,
      headers.join(','),
      ...csvData.map(row => row.join(',')),
      ...footer
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
      title: "✅ Relatório baixado com sucesso!",
      description: `📄 Arquivo ${filename}.csv foi gerado com ${data.length} produtos`,
    });
  };

  const handleDownloadReport = (type: string) => {
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');

    switch (type) {
      case 'geral':
        downloadCSV(products, `RELATORIO_GERAL_${timestamp}`, 'Relatório Geral de Produtos');
        break;
      case 'vencidos':
        const vencidos = products.filter(p => p.status === 'vencido');
        downloadCSV(vencidos, `PRODUTOS_VENCIDOS_${timestamp}`, 'Produtos Vencidos');
        break;
      case 'proximo-vencimento':
        const proximoVencimento = products.filter(p => p.status === 'proximo-vencimento');
        downloadCSV(proximoVencimento, `PROXIMO_VENCIMENTO_${timestamp}`, 'Produtos Próximos ao Vencimento');
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
                    📊 Relatórios
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Visualize e exporte relatórios organizados do sistema
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="font-bold">📋 Relatório Geral</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    <strong>Relatório completo</strong> com todos os produtos cadastrados
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-blue-800 font-bold text-lg">{products.length} produtos</p>
                  </div>
                  <Button 
                    onClick={() => handleDownloadReport('geral')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <strong>Baixar Relatório CSV</strong>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-red-600" />
                    <span className="font-bold">⚠️ Produtos Vencidos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    <strong>Lista de produtos</strong> com data de validade expirada
                  </p>
                  <div className="bg-red-50 p-3 rounded-lg mb-4">
                    <p className="text-red-800 font-bold text-lg">{stats.vencidos} produtos</p>
                  </div>
                  <Button 
                    onClick={() => handleDownloadReport('vencidos')}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <strong>Baixar Relatório CSV</strong>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-yellow-50">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold">⏰ Próximos ao Vencimento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    <strong>Produtos que vencem</strong> nos próximos 7 dias
                  </p>
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <p className="text-yellow-800 font-bold text-lg">{stats.proximoVencimento} produtos</p>
                  </div>
                  <Button 
                    onClick={() => handleDownloadReport('proximo-vencimento')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <strong>Baixar Relatório CSV</strong>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardTitle className="font-bold text-xl">📈 Resumo Estatístico</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center bg-blue-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                      <p className="text-sm font-semibold text-gray-700">TOTAL DE PRODUTOS</p>
                    </div>
                    <div className="text-center bg-green-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{stats.validos}</p>
                      <p className="text-sm font-semibold text-gray-700">PRODUTOS VÁLIDOS</p>
                    </div>
                    <div className="text-center bg-yellow-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold text-yellow-600">{stats.proximoVencimento}</p>
                      <p className="text-sm font-semibold text-gray-700">PRÓXIMO VENCIMENTO</p>
                    </div>
                    <div className="text-center bg-red-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold text-red-600">{stats.vencidos}</p>
                      <p className="text-sm font-semibold text-gray-700">PRODUTOS VENCIDOS</p>
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
