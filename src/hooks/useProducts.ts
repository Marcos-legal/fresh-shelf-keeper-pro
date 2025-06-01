
import { useState, useEffect, useMemo } from 'react';
import { Product, ProductFormData, ProductStats, StorageLocation } from '@/types/product';
import { parseValidadeDate } from '@/utils/productValidation';

const STORAGE_KEY = 'sistema-validade-produtos';

// Helper function to safely parse dates
const safeParseDate = (dateValue: any): Date | undefined => {
  if (!dateValue) return undefined;
  
  try {
    // Handle complex date structure from localStorage
    if (typeof dateValue === 'object' && dateValue._type === 'Date' && dateValue.value) {
      if (dateValue.value.iso) {
        const date = new Date(dateValue.value.iso);
        return isNaN(date.getTime()) ? undefined : date;
      }
    }
    
    // Handle undefined values stored as objects
    if (typeof dateValue === 'object' && (dateValue._type === 'undefined' || dateValue.value === 'undefined')) {
      return undefined;
    }
    
    // Handle string dates in YYYY-MM-DD format
    if (typeof dateValue === 'string') {
      const [year, month, day] = dateValue.split('-').map(Number);
      if (year && month && day) {
        // Criar data usando componentes para evitar problemas de timezone
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? undefined : dateValue;
    }
    
    return undefined;
  } catch (error) {
    console.warn('Error parsing date:', dateValue, error);
    return undefined;
  }
};

// Helper function to safely format date for storage
const formatDateForStorage = (date: Date | undefined): string | null => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return null;
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
          const criadoEm = safeParseDate(p.criadoEm) || new Date();
          const atualizadoEm = safeParseDate(p.atualizadoEm) || new Date();

          return {
            ...p,
            dataFabricacao,
            validade,
            dataAbertura,
            utilizarAte,
            criadoEm,
            atualizadoEm,
            showOptionalDates: p.showOptionalDates ?? false, // Carregar preferência individual
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
        validade: formatDateForStorage(product.validade instanceof Date ? product.validade : undefined),
        dataAbertura: formatDateForStorage(product.dataAbertura),
        utilizarAte: formatDateForStorage(product.utilizarAte),
        criadoEm: formatDateForStorage(product.criadoEm) || new Date().toISOString().split('T')[0],
        atualizadoEm: formatDateForStorage(product.atualizadoEm) || new Date().toISOString().split('T')[0],
        showOptionalDates: product.showOptionalDates ?? false,
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
    
    // Use utilizarAte if available, otherwise try to use validade if it's a Date
    let targetDate: Date | undefined;
    
    if (product.utilizarAte instanceof Date) {
      targetDate = product.utilizarAte;
    } else if (product.validade instanceof Date) {
      targetDate = product.validade;
    }
    
    if (!targetDate || !(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
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
    
    const dataFabricacao = data.dataFabricacao ? safeParseDate(data.dataFabricacao) : undefined;
    const validade = data.validade ? parseValidadeDate(data.validade) : undefined;
    const dataAbertura = data.dataAbertura ? safeParseDate(data.dataAbertura) : undefined;
    
    console.log('Criando produto com data de abertura:', data.dataAbertura, 'parsed:', dataAbertura);
    console.log('Criando produto com validade:', data.validade, 'parsed:', validade);
    
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
      showOptionalDates: data.showOptionalDates ?? false, // Incluir preferência individual
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
        console.log('Atualizando produto com dataAbertura:', data.dataAbertura);
        console.log('Atualizando produto com validade:', data.validade);
        
        const dataAbertura = data.dataAbertura ? safeParseDate(data.dataAbertura) : product.dataAbertura;
        const validade = data.validade ? parseValidadeDate(data.validade) : product.validade;
        const utilizarAte = dataAbertura && (data.diasParaVencer !== undefined || product.diasParaVencer)
          ? calculateUtilizarAte(dataAbertura, data.diasParaVencer ?? product.diasParaVencer)
          : product.utilizarAte;

        const updatedProduct = {
          ...product,
          ...data,
          dataFabricacao: data.dataFabricacao ? safeParseDate(data.dataFabricacao) || product.dataFabricacao : product.dataFabricacao,
          validade,
          dataAbertura,
          utilizarAte,
          atualizadoEm: new Date(),
          showOptionalDates: data.showOptionalDates !== undefined ? data.showOptionalDates : product.showOptionalDates,
        };

        console.log('Produto atualizado:', updatedProduct);
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
