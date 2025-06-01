import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { Product, ProductFormData } from "@/types/product";
import { ProductTable } from "@/components/ProductTable";
import { ProductForm } from "@/components/ProductForm";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Plus, Package, CheckCircle, AlertTriangle, XCircle, Thermometer, Snowflake, Home, Refrigerator, TrendingUp, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'yellow' | 'red';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, variant, description }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>{title}</span>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const Index = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, stats, getProductsByCategory } = useProducts();
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

  // Produtos próximos do vencimento (7 dias)
  const proximosVencimento = products.filter(product => {
    const now = new Date();
    let targetDate: Date | undefined;
    
    if (product.utilizarAte instanceof Date) {
      targetDate = product.utilizarAte;
    } else if (product.validade instanceof Date) {
      targetDate = product.validade;
    }
    
    if (!targetDate) return false;
    
    const daysToExpire = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysToExpire <= 7 && daysToExpire > 0;
  });

  // Produtos vencidos
  const produtosVencidos = products.filter(product => product.status === 'vencido');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-blue-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            {/* Header Moderno */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 gradient-blue rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Dashboard Inteligente
                    </h1>
                    <p className="text-gray-600 mt-1 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Controle total de validades em tempo real</span>
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(!showForm);
                }} 
                className="gradient-blue text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                {showForm ? 'Cancelar' : 'Novo Produto'}
              </Button>
            </div>

            {/* Cards de Estatísticas Principais */}
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
                description="Em condições ideais"
              />
              <StatsCard
                title="Próximo Vencimento"
                value={stats.proximoVencimento}
                icon={AlertTriangle}
                variant="warning"
                description="Vence em até 7 dias"
              />
              <StatsCard
                title="Vencidos"
                value={stats.vencidos}
                icon={XCircle}
                variant="danger"
                description="Necessita atenção"
              />
            </div>

            {/* Cards de Locais de Armazenamento - Clicáveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                onClick={() => navigate('/refrigerado')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-blue-700">
                    <span className="text-lg font-semibold">Refrigerado</span>
                    <Thermometer className="w-6 h-6" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 mb-1">
                    {stats.porCategoria.refrigerado}
                  </div>
                  <p className="text-sm text-blue-600">produtos refrigerados</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200"
                onClick={() => navigate('/congelado')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-cyan-700">
                    <span className="text-lg font-semibold">Congelado</span>
                    <Snowflake className="w-6 h-6" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-900 mb-1">
                    {stats.porCategoria.congelado}
                  </div>
                  <p className="text-sm text-cyan-600">produtos congelados</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                onClick={() => navigate('/ambiente')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-green-700">
                    <span className="text-lg font-semibold">Ambiente</span>
                    <Home className="w-6 h-6" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900 mb-1">
                    {stats.porCategoria.ambiente}
                  </div>
                  <p className="text-sm text-green-600">temperatura ambiente</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                onClick={() => navigate('/camara-fria')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-purple-700">
                    <span className="text-lg font-semibold">Câmara Fria</span>
                    <Refrigerator className="w-6 h-6" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900 mb-1">
                    {stats.porCategoria['camara-fria']}
                  </div>
                  <p className="text-sm text-purple-600">câmara refrigerada</p>
                </CardContent>
              </Card>
            </div>

            {/* Alertas Inteligentes */}
            {(proximosVencimento.length > 0 || produtosVencidos.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {proximosVencimento.length > 0 && (
                  <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-yellow-700">
                        <Clock className="w-5 h-5" />
                        <span>Atenção Requerida</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-yellow-700 mb-4">
                        {proximosVencimento.length} produto(s) vencendo em breve
                      </p>
                      <div className="space-y-2">
                        {proximosVencimento.slice(0, 3).map(product => (
                          <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded-lg">
                            <span className="font-medium text-gray-900">{product.nome}</span>
                            <span className="text-sm text-yellow-600">{product.lote}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {produtosVencidos.length > 0 && (
                  <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-red-700">
                        <XCircle className="w-5 h-5" />
                        <span>Ação Urgente</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-700 mb-4">
                        {produtosVencidos.length} produto(s) vencidos
                      </p>
                      <div className="space-y-2">
                        {produtosVencidos.slice(0, 3).map(product => (
                          <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded-lg">
                            <span className="font-medium text-gray-900">{product.nome}</span>
                            <span className="text-sm text-red-600">{product.lote}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

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
                    showOptionalDates: editingProduct.showOptionalDates ?? false,
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
