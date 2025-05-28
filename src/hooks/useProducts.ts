import { useState, useEffect, useMemo } from 'react';
import { Product, ProductFormData, ProductStats, StorageLocation } from '@/types/product';

const STORAGE_KEY = 'sistema-validade-produtos';

// Helper function to safely parse dates
const safeParseDate = (dateValue: any): Date | undefined => {
  if (!dateValue) return undefined;
  
  try {
    const date = new Date(dateValue);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateValue);
      return undefined;
    }
    return date;
  } catch (error) {
    console.warn('Error parsing date:', dateValue, error);
    return undefined;
  }
};

// Helper function to safely format date for storage
const formatDateForStorage = (date: Date): string => {
  try {
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return new Date().toISOString().split('T')[0]; // Return today as fallback
  }
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar produtos do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProducts = JSON.parse(stored).map((p: any) => {
          const dataFabricacao = safeParseDate(p.dataFabricacao);
          const validade = safeParseDate(p.validade);
          const dataAbertura = safeParseDate(p.dataAbertura);
          const utilizarAte = safeParseDate(p.utilizarAte);
          const criadoEm = safeParseDate(p.criadoEm);
          const atualizadoEm = safeParseDate(p.atualizadoEm);

          // Create valid product with fallbacks for required dates
          const now = new Date();
          return {
            ...p,
            dataFabricacao: dataFabricacao || now,
            validade: validade || now,
            dataAbertura,
            utilizarAte,
            criadoEm: criadoEm || now,
            atualizadoEm: atualizadoEm || now,
          };
        });
        
        console.log('Produtos carregados do localStorage:', parsedProducts);
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
      const productsToSave = updatedProducts.map(product => ({
        ...product,
        dataFabricacao: formatDateForStorage(product.dataFabricacao),
        validade: formatDateForStorage(product.validade),
        dataAbertura: product.dataAbertura ? formatDateForStorage(product.dataAbertura) : null,
        utilizarAte: product.utilizarAte ? formatDateForStorage(product.utilizarAte) : null,
        criadoEm: formatDateForStorage(product.criadoEm),
        atualizadoEm: formatDateForStorage(product.atualizadoEm),
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productsToSave));
      setProducts(updatedProducts);
      console.log('Produtos salvos:', updatedProducts);
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
    }
  };

  // Calcular status do produto
  const calculateStatus = (product: Product): 'valido' | 'proximo-vencimento' | 'vencido' => {
    const now = new Date();
    const targetDate = product.utilizarAte || product.validade;
    
    if (!targetDate || isNaN(targetDate.getTime())) {
      return 'vencido';
    }
    
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
    if (!dataAbertura || isNaN(dataAbertura.getTime()) || !diasParaVencer) {
      return new Date();
    }
    
    const utilizarAte = new Date(dataAbertura);
    utilizarAte.setDate(utilizarAte.getDate() + diasParaVencer);
    return utilizarAte;
  };

  // Criar produto
  const createProduct = (data: ProductFormData): Product => {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const dataFabricacao = safeParseDate(data.dataFabricacao) || now;
    const validade = safeParseDate(data.validade) || now;
    const dataAbertura = data.dataAbertura ? safeParseDate(data.dataAbertura) : undefined;
    
    const utilizarAte = dataAbertura 
      ? calculateUtilizarAte(dataAbertura, data.diasParaVencer)
      : undefined;

    const product: Product = {
      id,
      nome: data.nome,
      lote: data.lote,
      marca: data.marca,
      dataFabricacao,
      validade,
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
        const dataAbertura = data.dataAbertura ? safeParseDate(data.dataAbertura) : product.dataAbertura;
        const utilizarAte = dataAbertura && (data.diasParaVencer !== undefined || product.diasParaVencer)
          ? calculateUtilizarAte(dataAbertura, data.diasParaVencer ?? product.diasParaVencer)
          : product.utilizarAte;

        const updatedProduct = {
          ...product,
          ...data,
          dataFabricacao: data.dataFabricacao ? safeParseDate(data.dataFabricacao) || product.dataFabricacao : product.dataFabricacao,
          validade: data.validade ? safeParseDate(data.validade) || product.validade : product.validade,
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
    if (!novaData || isNaN(novaData.getTime())) {
      console.warn('Invalid date provided for updateDataAbertura:', novaData);
      return;
    }

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
