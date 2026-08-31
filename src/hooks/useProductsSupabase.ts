import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEmpresa } from '@/contexts/EmpresaContext';
import { Product, ProductFormData, StorageLocation } from '@/types/product';
import { toast } from '@/hooks/use-toast';
import { parseValidadeDate } from '@/utils/productValidation';
import type { Database } from '@/integrations/supabase/types';

type SupabaseProductRow = Database['public']['Tables']['products']['Row'];
type SupabaseProductUpdate = Database['public']['Tables']['products']['Update'];

export function useProductsSupabase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { activeEmpresaId } = useEmpresa();

  const mapDbRowToProduct = (row: SupabaseProductRow): Product => {
    const parseDate = (dateStr: string | null): Date | undefined => {
      if (!dateStr) return undefined;
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };
    return {
      id: row.id.toString(), nome: row.name || '', lote: row.lot || '', brand: row.brand || '',
      marca: row.brand || '', dataFabricacao: parseDate(row.manufacture_date), validade: parseDate(row.expiry_date),
      dataAbertura: parseDate(row.opening_date), diasParaVencer: row.days_valid || 0, utilizarAte: parseDate(row.use_by_date),
      localArmazenamento: row.storage as StorageLocation || 'ambiente', responsavel: row.responsible || '',
      precoCusto: (row as { preco_custo?: number | string | null }).preco_custo != null ? Number((row as { preco_custo: number | string }).preco_custo) : undefined,
      status: 'valido', criadoEm: new Date(row.created_at), atualizadoEm: new Date(row.created_at), showOptionalDates: false,
    };
  };

  const loadProducts = async () => {
    if (!user || !activeEmpresaId) { setProducts([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('products').select('*').eq('empresa_id', activeEmpresaId).order('created_at', { ascending: false });
      if (error) { console.error('Error loading products:', error); toast({ title: "Erro ao carregar produtos", description: "Não foi possível carregar os produtos do banco de dados.", variant: "destructive" }); return; }
      setProducts(data.map(mapDbRowToProduct));
    } catch (error) { console.error('Error loading products:', error); toast({ title: "Erro inesperado", description: "Ocorreu um erro ao carregar os produtos.", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, [user, activeEmpresaId]);

  const addProduct = async (data: ProductFormData) => {
    if (!user) { toast({ title: "Usuário não autenticado", description: "Faça login para adicionar produtos.", variant: "destructive" }); return; }
    if (!activeEmpresaId) { toast({ title: "Empresa não selecionada", description: "Aguarde o carregamento da empresa ou selecione uma antes de cadastrar.", variant: "destructive" }); return; }
    try {
      let expiryDate = null;
      if (data.validade?.trim()) { const parsedDate = parseValidadeDate(data.validade); if (parsedDate) expiryDate = parsedDate.toISOString().split('T')[0]; }
      let useByDate = null;
      if (data.dataAbertura?.trim() && data.diasParaVencer && data.diasParaVencer > 0) {
        const [year, month, day] = data.dataAbertura.split('-').map(Number); const useBy = new Date(year, month - 1, day + data.diasParaVencer);
        useByDate = `${useBy.getFullYear()}-${String(useBy.getMonth() + 1).padStart(2, '0')}-${String(useBy.getDate()).padStart(2, '0')}`;
      }
      const productData = { name: data.nome || '', lot: data.lote || '', brand: data.marca || '', manufacture_date: data.dataFabricacao || null, expiry_date: expiryDate, opening_date: data.dataAbertura || null, days_valid: data.diasParaVencer || 0, use_by_date: useByDate, storage: data.localArmazenamento || 'ambiente', responsible: data.responsavel || '', status: 'active', user_id: user.id, empresa_id: activeEmpresaId, preco_custo: data.precoCusto ?? null };
      const { error } = await supabase.from('products').insert([productData as never]);
      if (error) { console.error('Error adding product:', error); toast({ title: "Erro ao adicionar produto", description: error.message || "Não foi possível adicionar o produto.", variant: "destructive" }); return; }
      toast({ title: "Produto adicionado", description: "O produto foi adicionado com sucesso." }); await loadProducts();
    } catch (error) { console.error('Error adding product:', error); toast({ title: "Erro inesperado", description: "Ocorreu um erro ao adicionar o produto.", variant: "destructive" }); }
  };

  const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
    if (!user) { toast({ title: "Usuário não autenticado", description: "Faça login para editar o produto.", variant: "destructive" }); return; }
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) { toast({ title: "Produto inválido", description: "Não foi possível identificar o produto para atualização.", variant: "destructive" }); return; }
    try {
      const updateData: SupabaseProductUpdate = {};
      if (data.nome !== undefined) updateData.name = data.nome;
      if (data.lote !== undefined) updateData.lot = data.lote;
      if (data.marca !== undefined) updateData.brand = data.marca;
      if (data.dataFabricacao !== undefined) updateData.manufacture_date = data.dataFabricacao?.trim() ? data.dataFabricacao : null;
      if (data.validade !== undefined) {
        if (data.validade?.trim()) {
          const parsedDate = parseValidadeDate(data.validade);
          if (!parsedDate || Number.isNaN(parsedDate.getTime())) { toast({ title: "Validade inválida", description: "Use DD/MM/AAAA ou Mês/Ano.", variant: "destructive" }); return; }
          updateData.expiry_date = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
        } else updateData.expiry_date = null;
      }
      const product = products.find(p => p.id === id);
      const daysValid = data.diasParaVencer !== undefined ? data.diasParaVencer : product?.diasParaVencer;
      if (data.dataAbertura !== undefined) updateData.opening_date = data.dataAbertura?.trim() ? data.dataAbertura : null;
      if (data.dataAbertura !== undefined && data.dataAbertura?.trim() && daysValid && daysValid > 0) {
        const [year, month, day] = data.dataAbertura.split('-').map(Number); const useBy = new Date(year, month - 1, day + daysValid);
        updateData.use_by_date = `${useBy.getFullYear()}-${String(useBy.getMonth() + 1).padStart(2, '0')}-${String(useBy.getDate()).padStart(2, '0')}`;
      } else if (data.dataAbertura !== undefined) updateData.use_by_date = null;
      if (data.diasParaVencer !== undefined) updateData.days_valid = data.diasParaVencer;
      if (data.localArmazenamento !== undefined) updateData.storage = data.localArmazenamento;
      if (data.responsavel !== undefined) updateData.responsible = data.responsavel;
      if (data.precoCusto !== undefined) (updateData as { preco_custo?: number | null }).preco_custo = data.precoCusto === null || Number.isNaN(data.precoCusto) ? null : data.precoCusto;
      if (Object.keys(updateData).length === 0) { toast({ title: "Nenhuma alteração", description: "Nenhum campo foi alterado." }); return; }

      const { data: updatedRows, error } = await supabase.from('products').update(updateData).eq('id', numericId).eq('empresa_id', activeEmpresaId).select('id');
      if (error) { console.error('Error updating product:', error); toast({ title: "Erro ao atualizar produto", description: error.message || "Não foi possível atualizar o produto.", variant: "destructive" }); return; }
      if (!updatedRows || updatedRows.length === 0) { console.error('Product update matched no rows', { numericId, activeEmpresaId }); toast({ title: "Produto não atualizado", description: "O produto não foi encontrado ou não há permissão para alterá-lo.", variant: "destructive" }); return; }
      await loadProducts();
      toast({ title: "Produto atualizado", description: "O produto foi atualizado com sucesso." });
    } catch (error) { console.error('Error updating product:', error); toast({ title: "Erro inesperado", description: "Ocorreu um erro ao atualizar o produto.", variant: "destructive" }); }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;
    try { const { error } = await supabase.from('products').delete().eq('id', Number(id)); if (error) { console.error('Error deleting product:', error); toast({ title: "Erro ao excluir produto", description: "Não foi possível excluir o produto.", variant: "destructive" }); return; } toast({ title: "Produto excluído", description: "O produto foi excluído com sucesso." }); await loadProducts(); }
    catch (error) { console.error('Error deleting product:', error); toast({ title: "Erro inesperado", description: "Ocorreu um erro ao excluir o produto.", variant: "destructive" }); }
  };

  const calculateStatus = (product: Product): 'valido' | 'proximo-vencimento' | 'vencido' => {
    const now = new Date(); let targetDate: Date | undefined;
    if (product.utilizarAte instanceof Date) targetDate = product.utilizarAte; else if (product.validade instanceof Date) targetDate = product.validade;
    if (!targetDate || !(targetDate instanceof Date) || isNaN(targetDate.getTime())) return 'valido';
    const today = new Date(now); today.setHours(0, 0, 0, 0); const validityDay = new Date(targetDate); validityDay.setHours(0, 0, 0, 0);
    if (validityDay < today) return 'vencido'; const daysToExpire = Math.ceil((validityDay.getTime() - today.getTime()) / 86400000); if (daysToExpire <= 1) return 'proximo-vencimento'; return 'valido';
  };
  const productsWithStatus = products.map(product => ({ ...product, status: calculateStatus(product) }));
  const getProductsByCategory = (category: StorageLocation) => productsWithStatus.filter(product => (product.localArmazenamento || 'ambiente') === category);
  const stats = { total: productsWithStatus.length, validos: productsWithStatus.filter(p => p.status === 'valido').length, proximoVencimento: productsWithStatus.filter(p => p.status === 'proximo-vencimento').length, vencidos: productsWithStatus.filter(p => p.status === 'vencido').length, porCategoria: { refrigerado: getProductsByCategory('refrigerado').length, congelado: getProductsByCategory('congelado').length, ambiente: getProductsByCategory('ambiente').length, 'camara-fria': getProductsByCategory('camara-fria').length } };

  const updateDataAbertura = async (id: string, novaData: Date) => {
    if (!novaData || isNaN(novaData.getTime())) return;
    try {
      const product = products.find(p => p.id === id); if (!product) { toast({ title: "Erro", description: "Produto não encontrado.", variant: "destructive" }); return; }
      let useByDate = null; const dateStr = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}-${String(novaData.getDate()).padStart(2, '0')}`;
      if (product.diasParaVencer && product.diasParaVencer > 0) { const useBy = new Date(novaData.getFullYear(), novaData.getMonth(), novaData.getDate() + product.diasParaVencer); useByDate = `${useBy.getFullYear()}-${String(useBy.getMonth() + 1).padStart(2, '0')}-${String(useBy.getDate()).padStart(2, '0')}`; }
      const { error } = await supabase.from('products').update({ opening_date: dateStr, use_by_date: useByDate }).eq('id', Number(id));
      if (error) { console.error('Erro ao atualizar data de abertura:', error); toast({ title: "Erro ao atualizar data", description: error.message, variant: "destructive" }); return; }
      await loadProducts(); toast({ title: "Data atualizada", description: "Data de abertura foi atualizada com sucesso!" });
    } catch (error) { console.error('Erro ao atualizar data de abertura:', error); toast({ title: "Erro ao atualizar data", description: "Ocorreu um erro ao atualizar a data de abertura.", variant: "destructive" }); }
  };

  return { products: productsWithStatus, loading, stats, addProduct, updateProduct, deleteProduct, updateDataAbertura, getProductsByCategory, refreshProducts: loadProducts };
}
