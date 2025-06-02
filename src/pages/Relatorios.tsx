
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { FileText, Download, BarChart3, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-blue-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            {/* Header moderno */}
            <div className="flex items-center space-x-4 mb-8">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    📊 Central de Relatórios
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">
                    Gerencie e exporte dados organizados do sistema
                  </p>
                </div>
              </div>
            </div>

            {/* Cards de Relatórios Modernos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {/* Relatório Geral */}
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6" />
                    <span className="font-bold text-lg">📋 Relatório Completo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Relatório detalhado</strong> com todos os produtos cadastrados no sistema
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-700">{products.length}</p>
                          <p className="text-sm text-blue-600 font-medium">produtos total</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleDownloadReport('geral')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg text-white font-bold py-3 transition-all duration-200"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Baixar Relatório Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Produtos Vencidos */}
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <XCircle className="w-6 h-6" />
                    <span className="font-bold text-lg">⚠️ Produtos Vencidos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Relatório crítico</strong> com produtos que já passaram da validade
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-red-200">
                      <div className="flex items-center justify-between">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-red-700">{stats.vencidos}</p>
                          <p className="text-sm text-red-600 font-medium">vencidos</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleDownloadReport('vencidos')}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg text-white font-bold py-3 transition-all duration-200"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Baixar Lista de Vencidos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Próximos ao Vencimento */}
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-bold text-lg">⏰ Atenção Especial</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Produtos urgentes</strong> que vencem nos próximos 7 dias
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-yellow-200">
                      <div className="flex items-center justify-between">
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-yellow-700">{stats.proximoVencimento}</p>
                          <p className="text-sm text-yellow-600 font-medium">próx. vencimento</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleDownloadReport('proximo-vencimento')}
                      className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-lg text-white font-bold py-3 transition-all duration-200"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Baixar Lista Urgente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Painel de Estatísticas Melhorado */}
            <Card className="shadow-2xl border-0 bg-gradient-to-r from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg pb-6">
                <CardTitle className="font-bold text-2xl flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8" />
                  <span>📈 Painel de Controle Estatístico</span>
                </CardTitle>
                <p className="text-gray-200 mt-2">Visão geral completa do status dos produtos</p>
              </CardHeader>
              <CardContent className="pt-8 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center group">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <BarChart3 className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-4xl font-bold text-white">{stats.total}</p>
                      <p className="text-sm font-semibold text-blue-100 mt-1">TOTAL GERAL</p>
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <CheckCircle className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-4xl font-bold text-white">{stats.validos}</p>
                      <p className="text-sm font-semibold text-green-100 mt-1">PRODUTOS VÁLIDOS</p>
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <AlertTriangle className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-4xl font-bold text-white">{stats.proximoVencimento}</p>
                      <p className="text-sm font-semibold text-yellow-100 mt-1">PRÓX. VENCIMENTO</p>
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <XCircle className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-4xl font-bold text-white">{stats.vencidos}</p>
                      <p className="text-sm font-semibold text-red-100 mt-1">PRODUTOS VENCIDOS</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Relatorios;
