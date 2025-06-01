import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { Product, ProductFormData } from "@/types/product";
import { ProductTable } from "@/components/ProductTable";
import { ProductForm } from "@/components/ProductForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>{title}</span>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const Index = () => {
  const { products, addProduct, updateProduct, deleteProduct, stats } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  console.log('Produtos carregados no Index:', products);

  const handleAddProduct = (data: ProductFormData) => {
    console.log('Adicionando produto no Index:', data);
    addProduct(data);
    setShowForm(false);
    toast({
      title: "Produto cadastrado",
      description: "Produto foi cadastrado com sucesso!",
    });
  };

  const handleEditProduct = (data: ProductFormData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      setEditingProduct(null);
      setShowForm(false);
      toast({
        title: "Produto atualizado",
        description: "Produto foi atualizado com sucesso!",
      });
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast({
      title: "Produto excluído",
      description: "Produto foi excluído com sucesso!",
      variant: "destructive",
    });
  };

  const handleEditClick = (product: Product) => {
    // Converter datas para formato string apropriado para o formulário
    const formattedProduct = {
      ...product,
      dataFabricacao: product.dataFabricacao instanceof Date 
        ? product.dataFabricacao.toISOString().split('T')[0] 
        : product.dataFabricacao || '',
      validade: typeof product.validade === 'string' 
        ? product.validade 
        : product.validade instanceof Date 
          ? product.validade.toISOString().split('T')[0] 
          : '',
      dataAbertura: product.dataAbertura instanceof Date 
        ? product.dataAbertura.toISOString().split('T')[0] 
        : product.dataAbertura || '',
    };
    
    setEditingProduct(product);
    setShowForm(true);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '-';
    
    try {
      if (typeof date === 'string') {
        // Handle string formats like "DEZEMBRO/2025" or "31/12/2025"
        if (date.includes('/')) {
          return date; // Return as-is for formatted strings
        }
        // Handle YYYY-MM-DD format
        const [year, month, day] = date.split('-').map(Number);
        if (year && month && day) {
          const dateObj = new Date(year, month - 1, day);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString('pt-BR');
          }
        }
      }
      
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
      
      return String(date);
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return '-';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Sistema de Controle de Validade
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Gerencie produtos e monitore validades
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(!showForm);
                }} 
                className="gradient-blue text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showForm ? 'Cancelar' : 'Novo Produto'}
              </Button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total de Produtos"
                value={stats.total}
                icon={Package}
                color="blue"
              />
              <StatsCard
                title="Produtos Válidos"
                value={stats.validos}
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Próximo Vencimento"
                value={stats.proximoVencimento}
                icon={AlertTriangle}
                color="yellow"
              />
              <StatsCard
                title="Vencidos"
                value={stats.vencidos}
                icon={XCircle}
                color="red"
              />
            </div>

            {/* Formulário */}
            {showForm && (
              <div className="mb-8">
                <ProductForm
                  onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
                  initialData={editingProduct ? {
                    nome: editingProduct.nome,
                    lote: editingProduct.lote,
                    marca: editingProduct.marca,
                    dataFabricacao: editingProduct.dataFabricacao instanceof Date 
                      ? editingProduct.dataFabricacao.toISOString().split('T')[0] 
                      : editingProduct.dataFabricacao || '',
                    validade: typeof editingProduct.validade === 'string' 
                      ? editingProduct.validade 
                      : editingProduct.validade instanceof Date 
                        ? editingProduct.validade.toISOString().split('T')[0] 
                        : '',
                    dataAbertura: editingProduct.dataAbertura instanceof Date 
                      ? editingProduct.dataAbertura.toISOString().split('T')[0] 
                      : editingProduct.dataAbertura || '',
                    diasParaVencer: editingProduct.diasParaVencer,
                    localArmazenamento: editingProduct.localArmazenamento,
                    responsavel: editingProduct.responsavel,
                    showOptionalDates: editingProduct.showOptionalDates ?? false, // Preservar configuração individual
                  } : undefined}
                  title={editingProduct ? 'Editar Produto' : 'Cadastro de Produto'}
                  submitLabel={editingProduct ? 'Atualizar Produto' : 'Salvar Produto'}
                />
              </div>
            )}

            {/* Tabela de produtos */}
            <ProductTable
              products={products}
              onEdit={handleEditClick}
              onDelete={handleDeleteProduct}
              title="Todos os Produtos"
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
