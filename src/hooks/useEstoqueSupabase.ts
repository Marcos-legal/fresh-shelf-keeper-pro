import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProdutoEstoque, ContagemEstoque, EstoqueFormData, ContagemFormData } from '@/types/estoque';

// Re-export types for components
export type { ProdutoEstoque, ContagemEstoque, EstoqueFormData, ContagemFormData };
import { toast } from '@/hooks/use-toast';

export function useEstoqueSupabase() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [contagens, setContagens] = useState<ContagemEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar produtos do Supabase
  const loadProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_estoque')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar produtos:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Ocorreu um erro ao carregar os produtos.",
        variant: "destructive",
      });
    }
  };

  // Carregar contagens do Supabase
  const loadContagens = async () => {
    try {
      const { data, error } = await supabase
        .from('contagens_estoque')
        .select('*')
        .order('data_contagem', { ascending: false });

      if (error) {
        console.error('Erro ao carregar contagens:', error);
        toast({
          title: "Erro ao carregar contagens",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Mapear dados do Supabase para o tipo esperado
      const mappedContagens = (data || []).map(contagem => ({
        ...contagem,
        unidade_quantidade_extra: contagem.unidade_quantidade_extra as 'porcoes' | 'unidades'
      }));
      setContagens(mappedContagens);
    } catch (error) {
      console.error('Erro ao carregar contagens:', error);
      toast({
        title: "Erro ao carregar contagens",
        description: "Ocorreu um erro ao carregar as contagens.",
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
    try {
      const { data: newProduct, error } = await supabase
        .from('produtos_estoque')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar produto:', error);
        toast({
          title: "Erro ao adicionar produto",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProdutos(prev => [newProduct, ...prev]);
      toast({
        title: "Produto adicionado",
        description: "Produto de estoque foi adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Ocorreu um erro ao adicionar o produto.",
        variant: "destructive",
      });
    }
  };

  // Atualizar produto de estoque
  const updateProdutoEstoque = async (id: string, data: Partial<EstoqueFormData>) => {
    try {
      const { data: updatedProduct, error } = await supabase
        .from('produtos_estoque')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        toast({
          title: "Erro ao atualizar produto",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProdutos(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast({
        title: "Produto atualizado",
        description: "Produto foi atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Ocorreu um erro ao atualizar o produto.",
        variant: "destructive",
      });
    }
  };

  // Excluir produto de estoque
  const deleteProdutoEstoque = async (id: string) => {
    try {
      // Primeiro excluir contagens relacionadas
      const { error: contagensError } = await supabase
        .from('contagens_estoque')
        .delete()
        .eq('produto_id', id);

      if (contagensError) {
        console.error('Erro ao excluir contagens:', contagensError);
        toast({
          title: "Erro ao excluir produto",
          description: contagensError.message,
          variant: "destructive",
        });
        return;
      }

      // Depois excluir o produto
      const { error } = await supabase
        .from('produtos_estoque')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir produto:', error);
        toast({
          title: "Erro ao excluir produto",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProdutos(prev => prev.filter(p => p.id !== id));
      setContagens(prev => prev.filter(c => c.produto_id !== id));
      toast({
        title: "Produto excluído",
        description: "Produto foi excluído com sucesso!",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro ao excluir produto",
        description: "Ocorreu um erro ao excluir o produto.",
        variant: "destructive",
      });
    }
  };

  // Adicionar contagem
  const addContagem = async (data: ContagemFormData) => {
    try {
      const produto = produtos.find(p => p.id === data.produto_id);
      if (!produto) {
        toast({
          title: "Erro",
          description: "Produto não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Calcular quantidade total
      const quantidadeBase = data.quantidade * produto.quantidade_por_unidade;
      let quantidadeTotal = quantidadeBase;

      if (data.quantidade_extra > 0) {
        if (data.unidade_quantidade_extra === 'porcoes') {
          quantidadeTotal += data.quantidade_extra;
        } else {
          // Se for unidades individuais, converter para porções
          const porcoesExtras = data.quantidade_extra / produto.quantidade_por_unidade;
          quantidadeTotal += porcoesExtras;
        }
      }

      const contagemData = {
        ...data,
        quantidade_total: quantidadeTotal,
      };

      const { data: newContagem, error } = await supabase
        .from('contagens_estoque')
        .insert([contagemData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar contagem:', error);
        toast({
          title: "Erro ao adicionar contagem",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Mapear dados do Supabase para o tipo esperado
      const mappedContagem = {
        ...newContagem,
        unidade_quantidade_extra: newContagem.unidade_quantidade_extra as 'porcoes' | 'unidades'
      };
      setContagens(prev => [mappedContagem, ...prev]);
      toast({
        title: "Contagem adicionada",
        description: "Contagem foi adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao adicionar contagem:', error);
      toast({
        title: "Erro ao adicionar contagem",
        description: "Ocorreu um erro ao adicionar a contagem.",
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

      if (error) {
        console.error('Erro ao excluir contagem:', error);
        toast({
          title: "Erro ao excluir contagem",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setContagens(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Contagem excluída",
        description: "Contagem foi excluída com sucesso!",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Erro ao excluir contagem:', error);
      toast({
        title: "Erro ao excluir contagem",
        description: "Ocorreu um erro ao excluir a contagem.",
        variant: "destructive",
      });
    }
  };

  // Obter estoque atual por produto
  const getEstoqueAtual = (produtoId: string) => {
    const contagensProduto = contagens.filter(c => c.produto_id === produtoId);
    return contagensProduto.reduce((total, contagem) => total + contagem.quantidade_total, 0);
  };

  // Função para migrar dados do localStorage
  const migrarDadosLocalStorage = async () => {
    try {
      const produtosLocal = localStorage.getItem('sistema-validade-produtos-estoque');
      const contagensLocal = localStorage.getItem('sistema-validade-contagens-estoque');

      if (produtosLocal) {
        const parsedProdutos = JSON.parse(produtosLocal);
        for (const produto of parsedProdutos) {
          const { id, ...produtoData } = produto;
          await addProdutoEstoque(produtoData);
        }
        localStorage.removeItem('sistema-validade-produtos-estoque');
      }

      if (contagensLocal) {
        const parsedContagens = JSON.parse(contagensLocal);
        for (const contagem of parsedContagens) {
          const { id, ...contagemData } = contagem;
          await addContagem(contagemData);
        }
        localStorage.removeItem('sistema-validade-contagens-estoque');
      }

      toast({
        title: "Migração concluída",
        description: "Dados migrados do localStorage para o Supabase com sucesso!",
      });
    } catch (error) {
      console.error('Erro na migração:', error);
      toast({
        title: "Erro na migração",
        description: "Ocorreu um erro ao migrar os dados.",
        variant: "destructive",
      });
    }
  };

  // Função para recarregar dados
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([loadProdutos(), loadContagens()]);
    setLoading(false);
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
    refreshData,
  };
}