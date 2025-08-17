
export interface ProdutoEstoque {
  id: string;
  nome: string;
  unidade_medida: string; // ex: "pacote", "caixa", "bandeja"
  quantidade_por_unidade: number; // ex: 22 porções, 60 unidades
  unidade_conteudo: string; // ex: "porções", "unidades", "fatias"
  created_at: string;
  updated_at: string;
}

export interface ContagemEstoque {
  id: string;
  produto_id: string;
  quantidade: number; // quantidade de unidades contadas
  quantidade_extra: number; // quantidade extra
  unidade_quantidade_extra: 'porcoes' | 'unidades'; // unidade da quantidade extra
  quantidade_total: number; // quantidade total calculada
  data_contagem: string;
  responsavel?: string;
  observacoes?: string;
}

export interface EstoqueFormData {
  nome: string;
  unidade_medida: string;
  quantidade_por_unidade: number;
  unidade_conteudo: string;
}

export interface ContagemFormData {
  produto_id: string;
  quantidade: number;
  quantidade_extra: number;
  unidade_quantidade_extra: 'porcoes' | 'unidades';
  responsavel?: string;
  observacoes?: string;
}
