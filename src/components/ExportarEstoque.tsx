import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3 } from "lucide-react";
import { ProdutoEstoque, ContagemEstoque } from "@/types/estoque";
import { toast } from "@/hooks/use-toast";
import { sanitizeForExcel } from "@/lib/security";
import * as XLSX from 'xlsx';

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
      // Preparar dados para planilha Excel moderna
      const dadosProdutos = produtos.map((produto, index) => {
        const estoqueAtual = getEstoqueAtual(produto.id);
        const contagensProduto = contagens.filter(c => c.produtoId === produto.id);
        const ultimaContagem = contagensProduto
          .sort((a, b) => new Date(b.dataContagem).getTime() - new Date(a.dataContagem).getTime())[0];
        
        const totalContagens = contagensProduto.length;
        const mediaEstoque = totalContagens > 0 ? 
          contagensProduto.reduce((acc, c) => acc + c.quantidadeTotal, 0) / totalContagens : 0;

        return {
          'ITEM': index + 1,
          '📦 PRODUTO': sanitizeForExcel(produto.nome || ''),
          '📏 UNIDADE MEDIDA': sanitizeForExcel(produto.unidadeMedida || ''),
          '🔢 QTD POR UNIDADE': sanitizeForExcel(`${produto.quantidadePorUnidade} ${produto.unidadeConteudo}`),
          '📊 ESTOQUE ATUAL': sanitizeForExcel(`${estoqueAtual.toFixed(2)} ${produto.unidadeConteudo}`),
          '📈 MÉDIA ESTOQUE': sanitizeForExcel(`${mediaEstoque.toFixed(2)} ${produto.unidadeConteudo}`),
          '🔄 TOTAL CONTAGENS': totalContagens,
          '📅 ÚLTIMA CONTAGEM': sanitizeForExcel(ultimaContagem ? formatarData(ultimaContagem.dataContagem) : 'Nunca contado'),
          '👤 ÚLTIMO RESPONSÁVEL': sanitizeForExcel(ultimaContagem?.responsavel || 'Não informado'),
          '📝 STATUS': sanitizeForExcel(estoqueAtual > 0 ? '✅ EM ESTOQUE' : '❌ SEM ESTOQUE'),
          '⚠️ ALERTA': sanitizeForExcel(estoqueAtual < (mediaEstoque * 0.2) ? '🔴 ESTOQUE BAIXO' : '🟢 OK'),
          '📊 MOVIMENTAÇÃO': sanitizeForExcel(totalContagens > 5 ? '🔥 ALTA' : totalContagens > 2 ? '🔸 MÉDIA' : '🔹 BAIXA')
        };
      });

      // Criar workbook com formatação moderna
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosProdutos);

      // Configurar larguras das colunas
      const colWidths = [
        { wch: 6 },   // ITEM
        { wch: 25 },  // PRODUTO
        { wch: 18 },  // UNIDADE MEDIDA
        { wch: 20 },  // QTD POR UNIDADE
        { wch: 18 },  // ESTOQUE ATUAL
        { wch: 18 },  // MÉDIA ESTOQUE
        { wch: 16 },  // TOTAL CONTAGENS
        { wch: 20 },  // ÚLTIMA CONTAGEM
        { wch: 20 },  // ÚLTIMO RESPONSÁVEL
        { wch: 16 },  // STATUS
        { wch: 18 },  // ALERTA
        { wch: 16 }   // MOVIMENTAÇÃO
      ];
      ws['!cols'] = colWidths;

      // Aplicar formatação moderna ao cabeçalho
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        
        ws[cellAddress].s = {
          font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "059669" } }, // Verde moderno
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: {
            top: { style: "thick", color: { rgb: "047857" } },
            bottom: { style: "thick", color: { rgb: "047857" } },
            left: { style: "thick", color: { rgb: "047857" } },
            right: { style: "thick", color: { rgb: "047857" } }
          }
        };
      }

      // Aplicar formatação às células de dados
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
          
          ws[cellAddress].s = {
            font: { sz: 11, color: { rgb: "374151" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "D1D5DB" } },
              bottom: { style: "thin", color: { rgb: "D1D5DB" } },
              left: { style: "thin", color: { rgb: "D1D5DB" } },
              right: { style: "thin", color: { rgb: "D1D5DB" } }
            },
            fill: {
              fgColor: { rgb: row % 2 === 0 ? "F3F4F6" : "FFFFFF" }
            }
          };

          // Formatação condicional para colunas específicas
          const cellValue = ws[cellAddress].v;
          
          // Coluna STATUS
          if (col === 9 && typeof cellValue === 'string') {
            if (cellValue.includes('EM ESTOQUE')) {
              ws[cellAddress].s.fill = { fgColor: { rgb: "D1FAE5" } };
              ws[cellAddress].s.font = { ...ws[cellAddress].s.font, color: { rgb: "065F46" }, bold: true };
            } else if (cellValue.includes('SEM ESTOQUE')) {
              ws[cellAddress].s.fill = { fgColor: { rgb: "FEE2E2" } };
              ws[cellAddress].s.font = { ...ws[cellAddress].s.font, color: { rgb: "991B1B" }, bold: true };
            }
          }

          // Coluna ALERTA
          if (col === 10 && typeof cellValue === 'string') {
            if (cellValue.includes('ESTOQUE BAIXO')) {
              ws[cellAddress].s.fill = { fgColor: { rgb: "FEF3C7" } };
              ws[cellAddress].s.font = { ...ws[cellAddress].s.font, color: { rgb: "92400E" }, bold: true };
            } else if (cellValue.includes('OK')) {
              ws[cellAddress].s.fill = { fgColor: { rgb: "ECFDF5" } };
              ws[cellAddress].s.font = { ...ws[cellAddress].s.font, color: { rgb: "047857" } };
            }
          }
        }
      }

      // Adicionar filtros automáticos
      ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_cell({ r: range.e.r, c: range.e.c })}` };

      // Congelar primeira linha
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      XLSX.utils.book_append_sheet(wb, ws, "Relatório Completo Estoque");

      // Gerar nome do arquivo
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `relatorio_estoque_moderno_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      toast({
        title: "📊 Relatório moderno exportado!",
        description: `Planilha "${filename}" com formatação profissional gerada.`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro na exportação",
        description: "Ocorreu um erro ao gerar o relatório moderno.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarHistoricoDetalhado = () => {
    setLoading(true);
    
    try {
      // Preparar dados do histórico com formatação moderna
      const dadosHistorico = contagens.map((contagem, index) => {
        const produto = produtos.find(p => p.id === contagem.produtoId);
        const quantidadeExtraTexto = contagem.quantidadeExtra > 0 ? 
          `${contagem.quantidadeExtra} ${contagem.unidadeQuantidadeExtra === 'porcoes' ? 
            produto?.unidadeConteudo : 'unidades individuais'}` : 'Nenhuma';

        return {
          'ID': sanitizeForExcel(`#${String(index + 1).padStart(4, '0')}`),
          '📦 PRODUTO': sanitizeForExcel(produto?.nome || 'Produto removido'),
          '📊 QTD PRINCIPAL': sanitizeForExcel(`${contagem.quantidade} ${produto?.unidadeMedida || '-'}`),
          '➕ QTD EXTRA': sanitizeForExcel(quantidadeExtraTexto),
          '🧮 TOTAL CALCULADO': sanitizeForExcel(`${contagem.quantidadeTotal.toFixed(2)} ${produto?.unidadeConteudo || '-'}`),
          '📅 DATA/HORA': sanitizeForExcel(formatarData(contagem.dataContagem)),
          '👤 RESPONSÁVEL': sanitizeForExcel(contagem.responsavel || 'Não informado'),
          '📝 OBSERVAÇÕES': sanitizeForExcel(contagem.observacoes || 'Nenhuma observação'),
          '⚙️ CÁLCULO': sanitizeForExcel(produto ? 
            `${contagem.quantidade} × ${produto.quantidadePorUnidade} + ${contagem.quantidadeExtra || 0}` : 
            'Produto removido'),
          '🎯 STATUS': sanitizeForExcel(contagem.quantidadeTotal > 0 ? '✅ VÁLIDA' : '⚪ ZERADA'),
          '📈 IMPACTO': sanitizeForExcel(contagem.quantidadeTotal > 100 ? '🔥 ALTO' : 
                       contagem.quantidadeTotal > 50 ? '🔸 MÉDIO' : '🔹 BAIXO')
        };
      });

      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosHistorico);

      // Configurar larguras
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 25 },  // PRODUTO
        { wch: 18 },  // QTD PRINCIPAL
        { wch: 20 },  // QTD EXTRA
        { wch: 20 },  // TOTAL CALCULADO
        { wch: 18 },  // DATA/HORA
        { wch: 18 },  // RESPONSÁVEL
        { wch: 30 },  // OBSERVAÇÕES
        { wch: 25 },  // CÁLCULO
        { wch: 12 },  // STATUS
        { wch: 12 }   // IMPACTO
      ];
      ws['!cols'] = colWidths;

      // Aplicar formatação moderna
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        
        ws[cellAddress].s = {
          font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "1E40AF" } }, // Azul moderno
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: {
            top: { style: "thick", color: { rgb: "1E3A8A" } },
            bottom: { style: "thick", color: { rgb: "1E3A8A" } },
            left: { style: "thick", color: { rgb: "1E3A8A" } },
            right: { style: "thick", color: { rgb: "1E3A8A" } }
          }
        };
      }

      // Aplicar formatação às células de dados
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
          
          ws[cellAddress].s = {
            font: { sz: 10, color: { rgb: "374151" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "E5E7EB" } },
              bottom: { style: "thin", color: { rgb: "E5E7EB" } },
              left: { style: "thin", color: { rgb: "E5E7EB" } },
              right: { style: "thin", color: { rgb: "E5E7EB" } }
            },
            fill: {
              fgColor: { rgb: row % 2 === 0 ? "F9FAFB" : "FFFFFF" }
            }
          };
        }
      }

      // Adicionar filtros e congelar primeira linha
      ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_cell({ r: range.e.r, c: range.e.c })}` };
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      XLSX.utils.book_append_sheet(wb, ws, "Histórico Detalhado");

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `historico_contagens_moderno_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      toast({
        title: "📋 Histórico moderno exportado!",
        description: `Planilha "${filename}" com análise detalhada gerada.`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro na exportação",
        description: "Ocorreu um erro ao gerar o histórico moderno.",
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
        📊 Relatório Moderno
      </Button>
      
      <Button
        onClick={exportarHistoricoDetalhado}
        disabled={loading || contagens.length === 0}
        variant="outline"
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        <FileText className="w-4 h-4 mr-2" />
        📋 Histórico Moderno
      </Button>
    </div>
  );
}
