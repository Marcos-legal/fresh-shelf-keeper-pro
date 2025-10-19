import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product, ProductFormData, StorageLocation } from '@/types/product';
import { toast } from '@/hooks/use-toast';
import { parseValidadeDate } from '@/utils/productValidation';

export function useProductsSupabase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Convert database row to Product interface
  const mapDbRowToProduct = (row: any): Product => {
    return {
      id: row.id.toString(),
      nome: row.name || '',
      lote: row.lot || '',
      marca: row.brand || '',
      dataFabricacao: row.manufacture_date ? new Date(row.manufacture_date) : undefined,
      validade: row.expiry_date ? new Date(row.expiry_date) : undefined,
      dataAbertura: row.opening_date ? new Date(row.opening_date) : undefined,
      diasParaVencer: row.days_valid || 0,
      utilizarAte: row.use_by_date ? new Date(row.use_by_date) : undefined,
      localArmazenamento: row.storage as StorageLocation || 'ambiente',
      responsavel: row.responsible || '',
      status: 'valido',
      criadoEm: new Date(row.created_at),
      atualizadoEm: new Date(row.created_at),
      showOptionalDates: false,
    };
  };

  // Load products from Supabase
  const loadProducts = async () => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos do banco de dados.",
          variant: "destructive",
        });
        return;
      }

      const mappedProducts = data.map(mapDbRowToProduct);
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load products when user changes
  useEffect(() => {
    loadProducts();
  }, [user]);

  // Add product to Supabase
  const addProduct = async (data: ProductFormData) => {
    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Faça login para adicionar produtos.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse validade date if provided
      let expiryDate = null;
      if (data.validade && data.validade.trim() !== '') {
        const parsedDate = parseValidadeDate(data.validade);
        if (parsedDate) {
          expiryDate = parsedDate.toISOString().split('T')[0];
        }
      }

      // Calculate use_by_date if both opening date and days are available
      let useByDate = null;
      if (data.dataAbertura && data.dataAbertura.trim() !== '' && data.diasParaVencer && data.diasParaVencer > 0) {
        const [year, month, day] = data.dataAbertura.split('-').map(Number);
        const openingDate = new Date(year, month - 1, day);
        const useBy = new Date(year, month - 1, day + data.diasParaVencer);
        useByDate = `${useBy.getFullYear()}-${String(useBy.getMonth() + 1).padStart(2, '0')}-${String(useBy.getDate()).padStart(2, '0')}`;
      }

      const productData = {
        name: data.nome || '',
        lot: data.lote || '',
        brand: data.marca || '',
        manufacture_date: data.dataFabricacao || null,
        expiry_date: expiryDate,
        opening_date: data.dataAbertura || null,
        days_valid: data.diasParaVencer || 0,
        use_by_date: useByDate,
        storage: data.localArmazenamento || 'ambiente',
        responsible: data.responsavel || '',
        status: 'active',
        user_id: user.id,
      };

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) {
        console.error('Error adding product:', error);
        toast({
          title: "Erro ao adicionar produto",
          description: "Não foi possível adicionar o produto.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso.",
      });

      // Reload products
      await loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao adicionar o produto.",
        variant: "destructive",
      });
    }
  };

  // Update product in Supabase
  const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (data.nome !== undefined) updateData.name = data.nome;
      if (data.lote !== undefined) updateData.lot = data.lote;
      if (data.marca !== undefined) updateData.brand = data.marca;
      
      // Converter string vazia para null para datas
      if (data.dataFabricacao !== undefined) {
        updateData.manufacture_date = (data.dataFabricacao && data.dataFabricacao.trim() !== '') 
          ? data.dataFabricacao 
          : null;
      }
      
      if (data.validade !== undefined) {
        // Parse validade date if provided
        if (data.validade && data.validade.trim() !== '') {
          const parsedDate = parseValidadeDate(data.validade);
          updateData.expiry_date = parsedDate ? parsedDate.toISOString().split('T')[0] : null;
        } else {
          updateData.expiry_date = null;
        }
      }
      
      if (data.dataAbertura !== undefined) {
        updateData.opening_date = (data.dataAbertura && data.dataAbertura.trim() !== '') 
          ? data.dataAbertura 
          : null;
        
        // Calculate use_by_date if both opening date and days are available
        const product = products.find(p => p.id === id);
        const daysValid = data.diasParaVencer !== undefined ? data.diasParaVencer : product?.diasParaVencer;
        
        if (data.dataAbertura && data.dataAbertura.trim() !== '' && daysValid && daysValid > 0) {
          const [year, month, day] = data.dataAbertura.split('-').map(Number);
          const useBy = new Date(year, month - 1, day + daysValid);
          updateData.use_by_date = `${useBy.getFullYear()}-${String(useBy.getMonth() + 1).padStart(2, '0')}-${String(useBy.getDate()).padStart(2, '0')}`;
        } else {
          updateData.use_by_date = null;
        }
      }
      
      if (data.diasParaVencer !== undefined) updateData.days_valid = data.diasParaVencer;
      if (data.localArmazenamento !== undefined) updateData.storage = data.localArmazenamento;
      if (data.responsavel !== undefined) updateData.responsible = data.responsavel;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', parseInt(id))
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Erro ao atualizar produto",
          description: "Não foi possível atualizar o produto.",
          variant: "destructive",
        });
        return;
      }

      // Reload products
      await loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar o produto.",
        variant: "destructive",
      });
    }
  };

  // Delete product from Supabase
  const deleteProduct = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', parseInt(id))
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Erro ao excluir produto",
          description: "Não foi possível excluir o produto.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });

      // Reload products
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao excluir o produto.",
        variant: "destructive",
      });
    }
  };

  // Calculate status
  const calculateStatus = (product: Product): 'valido' | 'proximo-vencimento' | 'vencido' => {
    const now = new Date();
    
    let targetDate: Date | undefined;
    
    if (product.utilizarAte instanceof Date) {
      targetDate = product.utilizarAte;
    } else if (product.validade instanceof Date) {
      targetDate = product.validade;
    }
    
    if (!targetDate || !(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
      return 'valido';
    }
    
    if (targetDate < now) {
      return 'vencido';
    }
    
    const daysToExpire = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpire <= 1) {
      return 'proximo-vencimento';
    }
    
    return 'valido';
  };

  // Products with calculated status
  const productsWithStatus = products.map(product => ({
    ...product,
    status: calculateStatus(product),
  }));

  // Filter products by category
  const getProductsByCategory = (category: StorageLocation) => {
    return productsWithStatus.filter(product => 
      (product.localArmazenamento || 'ambiente') === category
    );
  };

  // Stats
  const stats = {
    total: productsWithStatus.length,
    validos: productsWithStatus.filter(p => p.status === 'valido').length,
    proximoVencimento: productsWithStatus.filter(p => p.status === 'proximo-vencimento').length,
    vencidos: productsWithStatus.filter(p => p.status === 'vencido').length,
    porCategoria: {
      refrigerado: getProductsByCategory('refrigerado').length,
      congelado: getProductsByCategory('congelado').length,
      ambiente: getProductsByCategory('ambiente').length,
      'camara-fria': getProductsByCategory('camara-fria').length,
    },
  };

  // Atualizar data de abertura
  const updateDataAbertura = async (id: string, novaData: Date) => {
    if (!novaData || isNaN(novaData.getTime())) {
      console.warn('Invalid date provided for updateDataAbertura:', novaData);
      return;
    }

    try {
      // Primeiro buscar o produto para calcular o novo use_by_date
      const product = products.find(p => p.id === id);
      if (!product) {
        toast({
          title: "Erro",
          description: "Produto não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Calcular nova data de uso baseada nos dias para vencer
      let useByDate = null;
      const dateStr = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}-${String(novaData.getDate()).padStart(2, '0')}`;
      
      if (product.diasParaVencer && product.diasParaVencer > 0) {
        const year = novaData.getFullYear();
        const month = novaData.getMonth();
        const day = novaData.getDate();
        const useBy = new Date(year, month, day + product.diasParaVencer);
        useByDate = `${useBy.getFullYear()}-${String(useBy.getMonth() + 1).padStart(2, '0')}-${String(useBy.getDate()).padStart(2, '0')}`;
      }

      // Atualizar no banco
      const { error } = await supabase
        .from('products')
        .update({
          opening_date: dateStr,
          use_by_date: useByDate,
        })
        .eq('id', parseInt(id));

      if (error) {
        console.error('Erro ao atualizar data de abertura:', error);
        toast({
          title: "Erro ao atualizar data",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Recarregar produtos
      await loadProducts();
      
      toast({
        title: "Data atualizada",
        description: "Data de abertura foi atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar data de abertura:', error);
      toast({
        title: "Erro ao atualizar data",
        description: "Ocorreu um erro ao atualizar a data de abertura.",
        variant: "destructive",
      });
    }
  };

  return {
    products: productsWithStatus,
    loading,
    stats,
    addProduct,
    updateProduct,
    deleteProduct,
    updateDataAbertura,
    getProductsByCategory,
    refreshProducts: loadProducts,
  };
}