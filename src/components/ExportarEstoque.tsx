
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3 } from "lucide-react";
import { ProdutoEstoque, ContagemEstoque } from "@/types/estoque";
import { toast } from "@/hooks/use-toast";

interface ExportarEstoqueProps {
  produtos: ProdutoEstoque[];
  contagens: ContagemEstoque[];
  getEstoqueAtual: (produtoId: string) => number;
}

export function ExportarEstoque({ produtos, contagens, getEstoqueAtual }: ExportarEstoqueProps) {
  const [loading, setLoading] = useState(false);

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  const exportarRelatorioCompleto = () => {
    setLoading(true);
    
    try {
      // Cabeçalho do relatório
      const cabecalho = [
        `RELATÓRIO DE ESTOQUE - ${formatarData(new Date())}`,
        `Sistema de Controle de Validade`,
        `Total de Produtos: ${produtos.length}`,
        `Total de Contagens: ${contagens.length}`,
        '',
        '========================================',
        ''
      ];

      // Dados dos produtos com análise detalhada
      const dadosProdutos = produtos.map(produto => {
        const estoqueAtual = getEstoqueAtual(produto.id);
        const contagensProduto = contagens.filter(c => c.produtoId === produto.id);
        const ultimaContagem = contagensProduto
          .sort((a, b) => new Date(b.dataContagem).getTime() - new Date(a.dataContagem).getTime())[0];
        
        const totalContagens = contagensProduto.length;
        const mediaEstoque = totalContagens > 0 ? 
          contagensProduto.reduce((acc, c) => acc + c.quantidadeTotal, 0) / totalContagens : 0;

        return {
          '📦 Produto': produto.nome,
          '📏 Unidade de Medida': produto.unidadeMedida,
          '🔢 Qtd por Unidade': `${produto.quantidadePorUnidade} ${produto.unidadeConteudo}`,
          '📊 Estoque Atual': `${estoqueAtual.toFixed(2)} ${produto.unidadeConteudo}`,
          '📈 Média de Estoque': `${mediaEstoque.toFixed(2)} ${produto.unidadeConteudo}`,
          '🔄 Total de Contagens': totalContagens,
          '📅 Última Contagem': ultimaContagem ? formatarData(ultimaContagem.dataContagem) : 'Nunca contado',
          '👤 Responsável Última': ultimaContagem?.responsavel || 'Não informado',
          '📝 Status': estoqueAtual > 0 ? 'EM ESTOQUE' : 'SEM ESTOQUE',
          '⚠️ Alertas': estoqueAtual < (mediaEstoque * 0.2) ? 'ESTOQUE BAIXO' : 'OK'
        };
      });

      // Estatísticas gerais
      const estatisticas = [
        '',
        '========================================',
        'ESTATÍSTICAS GERAIS',
        '========================================',
        `Produtos com estoque: ${produtos.filter(p => getEstoqueAtual(p.id) > 0).length}`,
        `Produtos sem estoque: ${produtos.filter(p => getEstoqueAtual(p.id) === 0).length}`,
        `Contagens realizadas hoje: ${contagens.filter(c => 
          new Date(c.dataContagem).toDateString() === new Date().toDateString()
        ).length}`,
        `Responsáveis ativos: ${new Set(contagens.map(c => c.responsavel).filter(Boolean)).size}`,
        ''
      ];

      // Converter para CSV
      const headers = Object.keys(dadosProdutos[0] || {});
      const csvContent = [
        ...cabecalho,
        headers.join(','),
        ...dadosProdutos.map(row => 
          headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
        ),
        ...estatisticas
      ].join('\n');

      // Fazer download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_estoque_completo_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "📊 Relatório exportado com sucesso!",
        description: "Relatório completo de estoque com análise detalhada gerado.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro na exportação",
        description: "Ocorreu um erro ao gerar o relatório completo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarHistoricoDetalhado = () => {
    setLoading(true);
    
    try {
      // Preparar dados do histórico com mais detalhes
      const dadosHistorico = contagens.map((contagem, index) => {
        const produto = produtos.find(p => p.id === contagem.produtoId);
        const quantidadeExtraTexto = contagem.quantidadeExtra > 0 ? 
          `${contagem.quantidadeExtra} ${contagem.unidadeQuantidadeExtra === 'porcoes' ? 
            produto?.unidadeConteudo : 'unidades individuais'}` : 'Nenhuma';

        return {
          '🔢 ID Contagem': `#${String(index + 1).padStart(4, '0')}`,
          '📦 Produto': produto?.nome || 'Produto removido',
          '📊 Qtd Principal': `${contagem.quantidade} ${produto?.unidadeMedida || '-'}`,
          '➕ Qtd Extra': quantidadeExtraTexto,
          '🧮 Total Calculado': `${contagem.quantidadeTotal.toFixed(2)} ${produto?.unidadeConteudo || '-'}`,
          '📅 Data/Hora': formatarData(contagem.dataContagem),
          '👤 Responsável': contagem.responsavel || 'Não informado',
          '📝 Observações': contagem.observacoes || 'Nenhuma observação',
          '⚙️ Método Cálculo': produto ? 
            `${contagem.quantidade} × ${produto.quantidadePorUnidade} + ${contagem.quantidadeExtra || 0} extra` : 
            'Produto removido',
          '🎯 Status': contagem.quantidadeTotal > 0 ? 'VÁLIDA' : 'ZERADA'
        };
      });

      // Adicionar resumo por responsável
      const resumoPorResponsavel = Array.from(
        new Set(contagens.map(c => c.responsavel).filter(Boolean))
      ).map(responsavel => {
        const contagensResp = contagens.filter(c => c.responsavel === responsavel);
        return {
          '👤 Responsável': responsavel,
          '🔢 Total Contagens': contagensResp.length,
          '📅 Primeira Contagem': formatarData(
            new Date(Math.min(...contagensResp.map(c => c.dataContagem.getTime())))
          ),
          '📅 Última Contagem': formatarData(
            new Date(Math.max(...contagensResp.map(c => c.dataContagem.getTime())))
          ),
          '📊 Média por Contagem': (
            contagensResp.reduce((acc, c) => acc + c.quantidadeTotal, 0) / contagensResp.length
          ).toFixed(2)
        };
      });

      // Converter para CSV
      const headers = Object.keys(dadosHistorico[0] || {});
      const headersResumo = Object.keys(resumoPorResponsavel[0] || {});
      
      const csvContent = [
        `HISTÓRICO DETALHADO DE CONTAGENS - ${formatarData(new Date())}`,
        `Sistema de Controle de Validade`,
        '',
        '========================================',
        'HISTÓRICO DE CONTAGENS',
        '========================================',
        headers.join(','),
        ...dadosHistorico.map(row => 
          headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
        ),
        '',
        '========================================',
        'RESUMO POR RESPONSÁVEL',
        '========================================',
        ...(resumoPorResponsavel.length > 0 ? [
          headersResumo.join(','),
          ...resumoPorResponsavel.map(row => 
            headersResumo.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
          )
        ] : ['Nenhum responsável registrado'])
      ].join('\n');

      // Fazer download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `historico_contagens_detalhado_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "📋 Histórico exportado com sucesso!",
        description: "Histórico detalhado com análise por responsável gerado.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro na exportação",
        description: "Ocorreu um erro ao gerar o histórico detalhado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={exportarRelatorioCompleto}
        disabled={loading || produtos.length === 0}
        variant="outline"
        className="border-green-500 text-green-600 hover:bg-green-50"
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        Relatório Completo
      </Button>
      
      <Button
        onClick={exportarHistoricoDetalhado}
        disabled={loading || contagens.length === 0}
        variant="outline"
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        <FileText className="w-4 h-4 mr-2" />
        Histórico Detalhado
      </Button>
    </div>
  );
}
