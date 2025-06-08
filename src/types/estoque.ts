
export interface ProdutoEstoque {
  id: string;
  nome: string;
  unidadeMedida: string; // ex: "pacote", "caixa", "bandeja"
  quantidadePorUnidade: number; // ex: 22 porções, 60 unidades
  unidadeConteudo: string; // ex: "porções", "unidades", "fatias"
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ContagemEstoque {
  id: string;
  produtoId: string;
  quantidade: number; // quantidade de unidades contadas
  quantidadeTotal: number; // quantidade * quantidadePorUnidade
  dataContagem: Date;
  responsavel?: string;
  observacoes?: string;
}

export interface EstoqueFormData {
  nome: string;
  unidadeMedida: string;
  quantidadePorUnidade: number;
  unidadeConteudo: string;
}

export interface ContagemFormData {
  produtoId: string;
  quantidade: number;
  responsavel?: string;
  observacoes?: string;
}
