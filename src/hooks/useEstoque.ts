
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
          criadoEm: new Date(p.criadoEm),
          atualizadoEm: new Date(p.atualizadoEm),
        }));
        setProdutos(parsedProdutos);
      }
      
      if (contagensStored) {
        const parsedContagens = JSON.parse(contagensStored).map((c: any) => ({
          ...c,
          dataContagem: new Date(c.dataContagem),
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
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };
    
    const updatedProdutos = [...produtos, novoProduto];
    saveProdutos(updatedProdutos);
  };

  // Atualizar produto de estoque
  const updateProdutoEstoque = (id: string, data: Partial<EstoqueFormData>) => {
    const updatedProdutos = produtos.map(produto => 
      produto.id === id 
        ? { ...produto, ...data, atualizadoEm: new Date() }
        : produto
    );
    saveProdutos(updatedProdutos);
  };

  // Excluir produto de estoque
  const deleteProdutoEstoque = (id: string) => {
    const updatedProdutos = produtos.filter(produto => produto.id !== id);
    saveProdutos(updatedProdutos);
    
    // Remover contagens relacionadas
    const updatedContagens = contagens.filter(contagem => contagem.produtoId !== id);
    saveContagens(updatedContagens);
  };

  // Adicionar contagem
  const addContagem = (data: ContagemFormData) => {
    const produto = produtos.find(p => p.id === data.produtoId);
    if (!produto) return;

    const novaContagem: ContagemEstoque = {
      id: crypto.randomUUID(),
      ...data,
      quantidadeTotal: data.quantidade * produto.quantidadePorUnidade,
      dataContagem: new Date(),
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
    const contagensProduto = contagens.filter(c => c.produtoId === produtoId);
    return contagensProduto.reduce((total, contagem) => total + contagem.quantidadeTotal, 0);
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
