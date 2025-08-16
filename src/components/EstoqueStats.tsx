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
  // Calcular estatísticas
  const totalProdutos = produtos.length;
  const totalContagens = contagens.length;
  
  // Produtos com estoque baixo (menos de 10 unidades)
  const produtosEstoqueBaixo = produtos.filter(produto => {
    const estoque = getEstoqueAtual(produto.id);
    return estoque > 0 && estoque < 10;
  }).length;
  
  // Produtos sem contagem recente (mais de 7 dias)
  const produtosSemContagemRecente = produtos.filter(produto => {
    const contagensProduto = contagens.filter(c => c.produto_id === produto.id);
    if (contagensProduto.length === 0) return true;
    
    const ultimaContagem = contagensProduto[0]; // já ordenado por data desc
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
      description: "Produtos com menos de 10 unidades",
      variant: produtosEstoqueBaixo > 0 ? "destructive" as const : "default" as const
    },
    {
      title: "Sem Contagem Recente",
      value: produtosSemContagemRecente,
      icon: Calendar,
      description: "Produtos não contados há mais de 7 dias",
      variant: produtosSemContagemRecente > 0 ? "secondary" as const : "default" as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {estatisticas.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.variant !== "default" && (
                <Badge variant={stat.variant}>
                  {stat.variant === "destructive" ? "Atenção" : "Verificar"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}