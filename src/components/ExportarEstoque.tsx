
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { ProdutoEstoque, ContagemEstoque } from "@/types/estoque";
import { toast } from "@/hooks/use-toast";

interface ExportarEstoqueProps {
  produtos: ProdutoEstoque[];
  contagens: ContagemEstoque[];
  getEstoqueAtual: (produtoId: string) => number;
}

export function ExportarEstoque({ produtos, contagens, getEstoqueAtual }: ExportarEstoqueProps) {
  const [loading, setLoading] = useState(false);

  const exportarCSV = () => {
    setLoading(true);
    
    try {
      // Preparar dados dos produtos
      const dadosProdutos = produtos.map(produto => {
        const estoqueAtual = getEstoqueAtual(produto.id);
        const ultimaContagem = contagens
          .filter(c => c.produtoId === produto.id)
          .sort((a, b) => new Date(b.dataContagem).getTime() - new Date(a.dataContagem).getTime())[0];
        
        return {
          'Nome do Produto': produto.nome,
          'Unidade de Medida': produto.unidadeMedida,
          'Quantidade por Unidade': produto.quantidadePorUnidade,
          'Unidade de Conteúdo': produto.unidadeConteudo,
          'Estoque Atual': estoqueAtual,
          'Última Contagem': ultimaContagem ? new Date(ultimaContagem.dataContagem).toLocaleDateString('pt-BR') : 'Nunca',
          'Responsável Última Contagem': ultimaContagem?.responsavel || '-'
        };
      });

      // Converter para CSV
      const headers = Object.keys(dadosProdutos[0] || {});
      const csvContent = [
        headers.join(','),
        ...dadosProdutos.map(row => 
          headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
        )
      ].join('\n');

      // Fazer download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `estoque_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: "Os dados do estoque foram exportados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarHistoricoCSV = () => {
    setLoading(true);
    
    try {
      // Preparar dados do histórico
      const dadosHistorico = contagens.map(contagem => {
        const produto = produtos.find(p => p.id === contagem.produtoId);
        return {
          'Produto': produto?.nome || 'Produto removido',
          'Quantidade Contada': contagem.quantidade,
          'Unidade de Medida': produto?.unidadeMedida || '-',
          'Total Calculado': contagem.quantidadeTotal,
          'Unidade de Conteúdo': produto?.unidadeConteudo || '-',
          'Data da Contagem': new Date(contagem.dataContagem).toLocaleDateString('pt-BR'),
          'Hora': new Date(contagem.dataContagem).toLocaleTimeString('pt-BR'),
          'Responsável': contagem.responsavel || '-',
          'Observações': contagem.observacoes || '-'
        };
      });

      // Converter para CSV
      const headers = Object.keys(dadosHistorico[0] || {});
      const csvContent = [
        headers.join(','),
        ...dadosHistorico.map(row => 
          headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
        )
      ].join('\n');

      // Fazer download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `historico_contagens_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: "O histórico de contagens foi exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o histórico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={exportarCSV}
        disabled={loading || produtos.length === 0}
        variant="outline"
        className="border-green-500 text-green-600 hover:bg-green-50"
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar Estoque
      </Button>
      
      <Button
        onClick={exportarHistoricoCSV}
        disabled={loading || contagens.length === 0}
        variant="outline"
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        <FileText className="w-4 h-4 mr-2" />
        Exportar Histórico
      </Button>
    </div>
  );
}
