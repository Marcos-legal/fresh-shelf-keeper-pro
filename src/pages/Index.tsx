
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsCard } from "@/components/StatsCard";
import { ProductTable } from "@/components/ProductTable";
import { ProductForm } from "@/components/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import { useState } from "react";
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Plus,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Product, ProductFormData } from "@/types/product";

const Index = () => {
  const { 
    products, 
    loading, 
    stats, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateDataAbertura 
  } = useProducts();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = (data: ProductFormData) => {
    try {
      addProduct(data);
      setIsFormOpen(false);
      toast({
        title: "Produto cadastrado",
        description: "O produto foi cadastrado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao cadastrar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleUpdateProduct = (data: ProductFormData) => {
    if (editingProduct) {
      try {
        updateProduct(editingProduct.id, data);
        setEditingProduct(null);
        setIsFormOpen(false);
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro ao atualizar",
          description: "Ocorreu um erro ao atualizar o produto.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        deleteProduct(id);
        toast({
          title: "Produto excluído",
          description: "O produto foi excluído com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir o produto.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePrintLabel = (product: Product) => {
    // Simular impressão de etiqueta
    const labelContent = `
      ETIQUETA TÉRMICA
      ================
      Produto: ${product.nome}
      Lote: ${product.lote}
      Marca: ${product.marca}
      Fabricação: ${product.dataFabricacao.toLocaleDateString('pt-BR')}
      Validade: ${product.validade.toLocaleDateString('pt-BR')}
      ${product.dataAbertura ? `Abertura: ${product.dataAbertura.toLocaleDateString('pt-BR')}` : ''}
      ${product.utilizarAte ? `Utilizar até: ${product.utilizarAte.toLocaleDateString('pt-BR')}` : ''}
      Local: ${product.localArmazenamento}
      ================
    `;
    
    console.log("Imprimindo etiqueta:", labelContent);
    toast({
      title: "Etiqueta enviada",
      description: "A etiqueta foi enviada para impressão!",
    });
  };

  const formInitialData = editingProduct ? {
    nome: editingProduct.nome,
    lote: editingProduct.lote,
    marca: editingProduct.marca,
    dataFabricacao: editingProduct.dataFabricacao.toISOString().split('T')[0],
    validade: editingProduct.validade.toISOString().split('T')[0],
    dataAbertura: editingProduct.dataAbertura?.toISOString().split('T')[0],
    diasParaVencer: editingProduct.diasParaVencer,
    localArmazenamento: editingProduct.localArmazenamento,
    responsavel: editingProduct.responsavel,
  } : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard - Sistema de Validade
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Controle e gerenciamento de produtos
                  </p>
                </div>
              </div>
              
              <Dialog open={isFormOpen} onOpenChange={(open) => {
                setIsFormOpen(open);
                if (!open) setEditingProduct(null);
              }}>
                <DialogTrigger asChild>
                  <Button className="gradient-blue text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
                    </DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                    initialData={formInitialData}
                    title=""
                    submitLabel={editingProduct ? 'Atualizar Produto' : 'Cadastrar Produto'}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total de Produtos"
                value={stats.total}
                icon={Package}
                variant="default"
                description="Produtos cadastrados"
              />
              <StatsCard
                title="Produtos Válidos"
                value={stats.validos}
                icon={CheckCircle}
                variant="success"
                description="Em conformidade"
              />
              <StatsCard
                title="Próximo Vencimento"
                value={stats.proximoVencimento}
                icon={AlertTriangle}
                variant="warning"
                description="Atenção necessária"
              />
              <StatsCard
                title="Produtos Vencidos"
                value={stats.vencidos}
                icon={XCircle}
                variant="danger"
                description="Ação imediata"
              />
            </div>

            {/* Gráfico de categorias */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Refrigerado</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.porCategoria.refrigerado}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Congelado</p>
                    <p className="text-2xl font-bold text-cyan-600">
                      {stats.porCategoria.congelado}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-cyan-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ambiente</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.porCategoria.ambiente}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Câmara Fria</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.porCategoria['camara-fria']}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Tabela de produtos */}
            <ProductTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onUpdateAbertura={updateDataAbertura}
              onPrintLabel={handlePrintLabel}
              title="Todos os Produtos"
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
