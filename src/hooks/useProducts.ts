
import { useState, useEffect, useMemo } from 'react';
import { Product, ProductFormData, ProductStats, StorageLocation } from '@/types/product';

const STORAGE_KEY = 'sistema-validade-produtos';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar produtos do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProducts = JSON.parse(stored).map((p: any) => ({
          ...p,
          dataFabricacao: new Date(p.dataFabricacao),
          validade: new Date(p.validade),
          dataAbertura: p.dataAbertura ? new Date(p.dataAbertura) : undefined,
          utilizarAte: p.utilizarAte ? new Date(p.utilizarAte) : undefined,
          criadoEm: new Date(p.criadoEm),
          atualizadoEm: new Date(p.atualizadoEm),
        }));
        setProducts(parsedProducts);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar produtos no localStorage
  const saveProducts = (updatedProducts: Product[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
    }
  };

  // Calcular status do produto
  const calculateStatus = (product: Product): 'valido' | 'proximo-vencimento' | 'vencido' => {
    const now = new Date();
    const targetDate = product.utilizarAte || product.validade;
    
    if (targetDate < now) {
      return 'vencido';
    }
    
    const daysToExpire = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpire <= 7) {
      return 'proximo-vencimento';
    }
    
    return 'valido';
  };

  // Calcular data "Utilizar até"
  const calculateUtilizarAte = (dataAbertura: Date, diasParaVencer: number): Date => {
    const utilizarAte = new Date(dataAbertura);
    utilizarAte.setDate(utilizarAte.getDate() + diasParaVencer);
    return utilizarAte;
  };

  // Criar produto
  const createProduct = (data: ProductFormData): Product => {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const dataAbertura = data.dataAbertura ? new Date(data.dataAbertura) : undefined;
    const utilizarAte = dataAbertura 
      ? calculateUtilizarAte(dataAbertura, data.diasParaVencer)
      : undefined;

    const product: Product = {
      id,
      nome: data.nome,
      lote: data.lote,
      marca: data.marca,
      dataFabricacao: new Date(data.dataFabricacao),
      validade: new Date(data.validade),
      dataAbertura,
      diasParaVencer: data.diasParaVencer,
      utilizarAte,
      localArmazenamento: data.localArmazenamento,
      responsavel: data.responsavel,
      status: 'valido',
      criadoEm: now,
      atualizadoEm: now,
    };

    product.status = calculateStatus(product);
    return product;
  };

  // Adicionar produto
  const addProduct = (data: ProductFormData) => {
    const newProduct = createProduct(data);
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
  };

  // Atualizar produto
  const updateProduct = (id: string, data: Partial<ProductFormData>) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        const dataAbertura = data.dataAbertura ? new Date(data.dataAbertura) : product.dataAbertura;
        const utilizarAte = dataAbertura && (data.diasParaVencer !== undefined || product.diasParaVencer)
          ? calculateUtilizarAte(dataAbertura, data.diasParaVencer ?? product.diasParaVencer)
          : product.utilizarAte;

        const updatedProduct = {
          ...product,
          ...data,
          dataFabricacao: data.dataFabricacao ? new Date(data.dataFabricacao) : product.dataFabricacao,
          validade: data.validade ? new Date(data.validade) : product.validade,
          dataAbertura,
          utilizarAte,
          atualizadoEm: new Date(),
        };

        updatedProduct.status = calculateStatus(updatedProduct);
        return updatedProduct;
      }
      return product;
    });

    saveProducts(updatedProducts);
  };

  // Excluir produto
  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    saveProducts(updatedProducts);
  };

  // Atualizar data de abertura
  const updateDataAbertura = (id: string, novaData: Date) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        const utilizarAte = calculateUtilizarAte(novaData, product.diasParaVencer);
        const updatedProduct = {
          ...product,
          dataAbertura: novaData,
          utilizarAte,
          atualizadoEm: new Date(),
        };
        updatedProduct.status = calculateStatus(updatedProduct);
        return updatedProduct;
      }
      return product;
    });

    saveProducts(updatedProducts);
  };

  // Estatísticas dos produtos
  const stats: ProductStats = useMemo(() => {
    const total = products.length;
    let validos = 0;
    let proximoVencimento = 0;
    let vencidos = 0;
    
    const porCategoria = {
      refrigerado: 0,
      congelado: 0,
      ambiente: 0,
      'camara-fria': 0,
    };

    products.forEach(product => {
      const status = calculateStatus(product);
      
      switch (status) {
        case 'valido':
          validos++;
          break;
        case 'proximo-vencimento':
          proximoVencimento++;
          break;
        case 'vencido':
          vencidos++;
          break;
      }

      porCategoria[product.localArmazenamento]++;
    });

    return {
      total,
      validos,
      proximoVencimento,
      vencidos,
      porCategoria,
    };
  }, [products]);

  // Filtrar produtos por categoria
  const getProductsByCategory = (category: StorageLocation) => {
    return products.filter(product => product.localArmazenamento === category);
  };

  // Produtos com status atualizado
  const productsWithUpdatedStatus = useMemo(() => {
    return products.map(product => ({
      ...product,
      status: calculateStatus(product),
    }));
  }, [products]);

  return {
    products: productsWithUpdatedStatus,
    loading,
    stats,
    addProduct,
    updateProduct,
    deleteProduct,
    updateDataAbertura,
    getProductsByCategory,
  };
}
