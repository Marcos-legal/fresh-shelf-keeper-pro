
import { useState, useEffect } from 'react';
import { ProdutoEstoque, ContagemEstoque, EstoqueFormData, ContagemFormData } from '@/types/estoque';

const PRODUTOS_STORAGE_KEY = 'sistema-validade-produtos-estoque';
const CONTAGENS_STORAGE_KEY = 'sistema-validade-contagens-estoque';

export function useEstoque() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [contagens, setContagens] = useState<ContagemEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const produtosStored = localStorage.getItem(PRODUTOS_STORAGE_KEY);
      const contagensStored = localStorage.getItem(CONTAGENS_STORAGE_KEY);
      
      if (produtosStored) {
        const parsedProdutos = JSON.parse(produtosStored).map((p: any) => ({
          ...p,
          created_at: p.created_at || new Date(p.criadoEm).toISOString(),
          updated_at: p.updated_at || new Date(p.atualizadoEm).toISOString(),
        }));
        setProdutos(parsedProdutos);
      }
      
      if (contagensStored) {
        const parsedContagens = JSON.parse(contagensStored).map((c: any) => ({
          ...c,
          data_contagem: c.data_contagem || new Date(c.dataContagem).toISOString(),
          // Garantir compatibilidade com versões antigas
          quantidade_extra: c.quantidade_extra || c.quantidadeExtra || 0,
          unidade_quantidade_extra: c.unidade_quantidade_extra || c.unidadeQuantidadeExtra || 'porcoes',
        }));
        setContagens(parsedContagens);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do estoque:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar produtos
  const saveProdutos = (updatedProdutos: ProdutoEstoque[]) => {
    try {
      localStorage.setItem(PRODUTOS_STORAGE_KEY, JSON.stringify(updatedProdutos));
      setProdutos(updatedProdutos);
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
    }
  };

  // Salvar contagens
  const saveContagens = (updatedContagens: ContagemEstoque[]) => {
    try {
      localStorage.setItem(CONTAGENS_STORAGE_KEY, JSON.stringify(updatedContagens));
      setContagens(updatedContagens);
    } catch (error) {
      console.error('Erro ao salvar contagens:', error);
    }
  };

  // Adicionar produto de estoque
  const addProdutoEstoque = (data: EstoqueFormData) => {
    const novoProduto: ProdutoEstoque = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const updatedProdutos = [...produtos, novoProduto];
    saveProdutos(updatedProdutos);
  };

  // Atualizar produto de estoque
  const updateProdutoEstoque = (id: string, data: Partial<EstoqueFormData>) => {
    const updatedProdutos = produtos.map(produto => 
      produto.id === id 
        ? { ...produto, ...data, updated_at: new Date().toISOString() }
        : produto
    );
    saveProdutos(updatedProdutos);
  };

  // Excluir produto de estoque
  const deleteProdutoEstoque = (id: string) => {
    const updatedProdutos = produtos.filter(produto => produto.id !== id);
    saveProdutos(updatedProdutos);
    
    // Remover contagens relacionadas
    const updatedContagens = contagens.filter(contagem => contagem.produto_id !== id);
    saveContagens(updatedContagens);
  };

  // Adicionar contagem
  const addContagem = (data: ContagemFormData) => {
    const produto = produtos.find(p => p.id === data.produto_id);
    if (!produto) return;

    // Calcular quantidade total considerando a unidade da quantidade extra
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

    const novaContagem: ContagemEstoque = {
      id: crypto.randomUUID(),
      produto_id: data.produto_id,
      quantidade: data.quantidade,
      quantidade_extra: data.quantidade_extra,
      unidade_quantidade_extra: data.unidade_quantidade_extra,
      quantidade_total: quantidadeTotal,
      data_contagem: new Date().toISOString(),
      responsavel: data.responsavel,
      observacoes: data.observacoes,
    };
    
    const updatedContagens = [...contagens, novaContagem];
    saveContagens(updatedContagens);
  };

  // Excluir contagem
  const deleteContagem = (id: string) => {
    const updatedContagens = contagens.filter(contagem => contagem.id !== id);
    saveContagens(updatedContagens);
  };

  // Obter estoque atual por produto
  const getEstoqueAtual = (produtoId: string) => {
    const contagensProduto = contagens.filter(c => c.produto_id === produtoId);
    return contagensProduto.reduce((total, contagem) => total + contagem.quantidade_total, 0);
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
  };
}
