import { Package, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContagemEstoque, ProdutoEstoque } from "@/hooks/useEstoqueSupabase";

interface EstoqueStatsProps {
  produtos: ProdutoEstoque[];
  contagens: ContagemEstoque[];
  getEstoqueAtual: (produtoId: string) => number;
}

export function EstoqueStats({ produtos, contagens, getEstoqueAtual }: EstoqueStatsProps) {
  const totalProdutos = produtos.length;
  const totalContagens = contagens.length;
  
  const produtosEstoqueBaixo = produtos.filter(produto => {
    const estoque = getEstoqueAtual(produto.id);
    return estoque > 0 && estoque < 10;
  }).length;
  
  const produtosSemContagemRecente = produtos.filter(produto => {
    const contagensProduto = contagens.filter(c => c.produto_id === produto.id);
    if (contagensProduto.length === 0) return true;
    
    const ultimaContagem = contagensProduto[0];
    const diasSemContagem = Math.floor((Date.now() - new Date(ultimaContagem.data_contagem).getTime()) / (1000 * 60 * 60 * 24));
    return diasSemContagem > 7;
  }).length;

  const estatisticas = [
    {
      title: "Total de Produtos",
      value: totalProdutos,
      icon: Package,
      description: "Produtos cadastrados",
      variant: "default" as const
    },
    {
      title: "Total de Contagens",
      value: totalContagens,
      icon: TrendingUp,
      description: "Contagens realizadas",
      variant: "default" as const
    },
    {
      title: "Estoque Baixo",
      value: produtosEstoqueBaixo,
      icon: AlertTriangle,
      description: "Menos de 10 unidades",
      variant: produtosEstoqueBaixo > 0 ? "destructive" as const : "default" as const
    },
    {
      title: "Sem Contagem",
      value: produtosSemContagemRecente,
      icon: Calendar,
      description: "Não contados há 7+ dias",
      variant: produtosSemContagemRecente > 0 ? "secondary" as const : "default" as const
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {estatisticas.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
              {stat.variant !== "default" && (
                <Badge variant={stat.variant} className="text-[10px] sm:text-xs">
                  {stat.variant === "destructive" ? "!" : "?"}
                </Badge>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
