import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ProdutoEstoque {
  id: string;
  nome: string;
  unidade_medida: string;
  quantidade_por_unidade: number;
  unidade_conteudo: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContagemEstoque {
  id: string;
  produto_id: string;
  quantidade: number;
  quantidade_extra: number;
  unidade_quantidade_extra: 'porcoes' | 'unidades';
  quantidade_total: number;
  data_contagem: string;
  responsavel?: string;
  observacoes?: string;
  user_id: string;
  created_at: string;
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
  data_contagem: string;
  responsavel?: string;
  observacoes?: string;
}

export function useEstoqueSupabase() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [contagens, setContagens] = useState<ContagemEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar produtos
  const loadProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_estoque')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos de estoque",
        variant: "destructive",
      });
    }
  };

  // Carregar contagens
  const loadContagens = async () => {
    try {
      const { data, error } = await supabase
        .from('contagens_estoque')
        .select('*')
        .order('data_contagem', { ascending: false });
      
      if (error) throw error;
      setContagens((data || []) as ContagemEstoque[]);
    } catch (error) {
      console.error('Erro ao carregar contagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contagens de estoque",
        variant: "destructive",
      });
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadProdutos(), loadContagens()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Adicionar produto de estoque
  const addProdutoEstoque = async (data: EstoqueFormData) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para adicionar produtos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('produtos_estoque')
        .insert([{
          ...data,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      await loadProdutos();
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto",
        variant: "destructive",
      });
    }
  };

  // Atualizar produto de estoque
  const updateProdutoEstoque = async (id: string, data: Partial<EstoqueFormData>) => {
    try {
      const { error } = await supabase
        .from('produtos_estoque')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      await loadProdutos();
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
    }
  };

  // Excluir produto de estoque
  const deleteProdutoEstoque = async (id: string) => {
    try {
      const { error } = await supabase
        .from('produtos_estoque')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await Promise.all([loadProdutos(), loadContagens()]);
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      });
    }
  };

  // Adicionar contagem
  const addContagem = async (data: ContagemFormData) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para adicionar contagens.",
        variant: "destructive",
      });
      return;
    }

    try {
      const produto = produtos.find(p => p.id === data.produto_id);
      if (!produto) {
        throw new Error('Produto não encontrado');
      }

      // Calcular quantidade total
      const quantidadeBase = data.quantidade * produto.quantidade_por_unidade;
      let quantidadeTotal = quantidadeBase;

      if (data.quantidade_extra > 0) {
        if (data.unidade_quantidade_extra === 'porcoes') {
          quantidadeTotal += data.quantidade_extra;
        } else {
          const porcoesExtras = data.quantidade_extra / produto.quantidade_por_unidade;
          quantidadeTotal += porcoesExtras;
        }
      }

      const contagemData = {
        ...data,
        quantidade_total: quantidadeTotal,
        user_id: user.id
      };

      const { error } = await supabase
        .from('contagens_estoque')
        .insert([contagemData]);
      
      if (error) throw error;
      
      await loadContagens();
      toast({
        title: "Sucesso",
        description: "Contagem adicionada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar contagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar contagem",
        variant: "destructive",
      });
    }
  };

  // Excluir contagem
  const deleteContagem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contagens_estoque')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await loadContagens();
      toast({
        title: "Sucesso",
        description: "Contagem excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir contagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir contagem",
        variant: "destructive",
      });
    }
  };

  // Obter estoque atual por produto
  const getEstoqueAtual = (produtoId: string) => {
    const contagensProduto = contagens.filter(c => c.produto_id === produtoId);
    return contagensProduto.reduce((total, contagem) => total + contagem.quantidade_total, 0);
  };

  // Migrar dados do localStorage para Supabase
  const migrarDadosLocalStorage = async () => {
    try {
      const produtosLocal = localStorage.getItem('sistema-validade-produtos-estoque');
      const contagensLocal = localStorage.getItem('sistema-validade-contagens-estoque');
      
      if (produtosLocal) {
        const produtosParsed = JSON.parse(produtosLocal);
        for (const produto of produtosParsed) {
          await supabase.from('produtos_estoque').insert({
            nome: produto.nome,
            unidade_medida: produto.unidadeMedida,
            quantidade_por_unidade: produto.quantidadePorUnidade,
            unidade_conteudo: produto.unidadeConteudo,
          });
        }
      }
      
      if (contagensLocal) {
        const contagensParsed = JSON.parse(contagensLocal);
        for (const contagem of contagensParsed) {
          await supabase.from('contagens_estoque').insert({
            produto_id: contagem.produtoId,
            quantidade: contagem.quantidade,
            quantidade_extra: contagem.quantidadeExtra || 0,
            unidade_quantidade_extra: contagem.unidadeQuantidadeExtra || 'porcoes',
            quantidade_total: contagem.quantidadeTotal,
            data_contagem: contagem.dataContagem,
            responsavel: contagem.responsavel,
            observacoes: contagem.observacoes,
          });
        }
      }
      
      await Promise.all([loadProdutos(), loadContagens()]);
      
      toast({
        title: "Migração concluída",
        description: "Dados migrados do localStorage para Supabase com sucesso",
      });
    } catch (error) {
      console.error('Erro na migração:', error);
      toast({
        title: "Erro na migração",
        description: "Erro ao migrar dados do localStorage",
        variant: "destructive",
      });
    }
  };

  return {
    produtos,
    contagens,
    loading,
    addProdutoEstoque,
    updateProdutoEstoque,
    deleteProdutoEstoque,
    addContagem,
    deleteContagem,
    getEstoqueAtual,
    migrarDadosLocalStorage,
    refreshData: () => Promise.all([loadProdutos(), loadContagens()]),
  };
}