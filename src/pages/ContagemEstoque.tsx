import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProdutoEstoqueForm } from "@/components/ProdutoEstoqueForm";
import { ContagemEstoqueForm } from "@/components/ContagemEstoqueForm";
import { ExportarEstoque } from "@/components/ExportarEstoque";
import { useEstoqueSupabase } from "@/hooks/useEstoqueSupabase";
import { EstoqueSearchFilter } from "@/components/EstoqueSearchFilter";
import { EstoqueStats } from "@/components/EstoqueStats";
import { Package, Calculator, Plus, Trash2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ContagemEstoque() {
  const {
    produtos,
    contagens,
    loading,
    addProdutoEstoque,
    deleteProdutoEstoque,
    addContagem,
    deleteContagem,
    getEstoqueAtual,
    migrarDadosLocalStorage,
    refreshData
  } = useEstoqueSupabase();

  const [showProdutoForm, setShowProdutoForm] = useState(false);
  const [showContagemForm, setShowContagemForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponsavel, setFilterResponsavel] = useState('all');

  // Filtros
  const responsaveis = [...new Set(contagens.map(c => c.responsavel).filter(Boolean))] as string[];
  
  const filteredProdutos = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredContagens = contagens.filter(contagem => {
    const produto = produtos.find(p => p.id === contagem.produto_id);
    const matchesSearch = !searchTerm || 
      produto?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contagem.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResponsavel = filterResponsavel === 'all' || contagem.responsavel === filterResponsavel;
    return matchesSearch && matchesResponsavel;
  });

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MobileDrawer />
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden w-full">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 pt-14 sm:pt-4 md:pt-6 lg:pt-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold gradient-text">Contagem de Estoque</h1>
              <div className="flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                onClick={migrarDadosLocalStorage}
                className="text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Migrar dados locais
              </Button>
              
              <ExportarEstoque 
                produtos={produtos}
                contagens={contagens}
                getEstoqueAtual={getEstoqueAtual}
              />
              
              <Dialog open={showProdutoForm} onOpenChange={setShowProdutoForm}>
                <DialogTrigger asChild>
                  <Button className="gradient-blue text-white">
                    <Package className="w-4 h-4 mr-2" />
                    Cadastrar Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Produto para Estoque</DialogTitle>
                  </DialogHeader>
                  <ProdutoEstoqueForm
                    onSubmit={(data) => {
                      addProdutoEstoque(data);
                      setShowProdutoForm(false);
                    }}
                  />
                </DialogContent>
              </Dialog>

              {produtos.length > 0 && (
                <Dialog open={showContagemForm} onOpenChange={setShowContagemForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                      <Calculator className="w-4 h-4 mr-2" />
                      Nova Contagem
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nova Contagem de Estoque</DialogTitle>
                    </DialogHeader>
                    <ContagemEstoqueForm
                      produtos={produtos}
                      onSubmit={addContagem}
                      onClose={() => setShowContagemForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
              </div>
            </div>
            {/* Estatísticas */}
            <EstoqueStats 
              produtos={produtos}
              contagens={contagens}
              getEstoqueAtual={getEstoqueAtual}
            />

            {/* Filtros de Busca */}
            <EstoqueSearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterResponsavel={filterResponsavel}
              onFilterResponsavelChange={setFilterResponsavel}
              responsaveis={responsaveis}
              onRefresh={refreshData}
              isLoading={loading}
            />

            {/* Produtos Cadastrados */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Produtos Cadastrados</span>
                <Badge variant="secondary">{filteredProdutos.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProdutos.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum produto cadastrado para estoque</p>
                  <Button onClick={() => setShowProdutoForm(true)} className="gradient-blue text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Produto
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Qtd por Unidade</TableHead>
                      <TableHead>Estoque Atual</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProdutos.map((produto) => {
                      const estoqueAtual = getEstoqueAtual(produto.id);
                      return (
                        <TableRow key={produto.id}>
                          <TableCell className="font-medium">{produto.nome}</TableCell>
                          <TableCell>{produto.unidade_medida}</TableCell>
                          <TableCell>
                            {produto.quantidade_por_unidade} {produto.unidade_conteudo}
                          </TableCell>
                          <TableCell>
                            <Badge variant={estoqueAtual > 0 ? "default" : "secondary"}>
                              {estoqueAtual} {produto.unidade_conteudo}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteProdutoEstoque(produto.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            </Card>

            {/* Histórico de Contagens */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Histórico de Contagens</span>
                <Badge variant="secondary">{filteredContagens.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredContagens.length === 0 ? (
                <div className="text-center py-8">
                  <Calculator className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma contagem realizada ainda</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd Principal</TableHead>
                      <TableHead>Qtd Extra</TableHead>
                      <TableHead>Total Calculado</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContagens
                      .sort((a, b) => new Date(b.data_contagem).getTime() - new Date(a.data_contagem).getTime())
                      .map((contagem) => {
                        const produto = produtos.find(p => p.id === contagem.produto_id);
                        const quantidadeExtraTexto = contagem.quantidade_extra > 0 ? 
                          `${contagem.quantidade_extra} ${contagem.unidade_quantidade_extra === 'porcoes' ? 
                            produto?.unidade_conteudo : 'un. ind.'}` : '-';
                        
                        return (
                          <TableRow key={contagem.id}>
                            <TableCell className="font-medium">
                              {produto?.nome || 'Produto removido'}
                            </TableCell>
                            <TableCell>
                              {contagem.quantidade} {produto?.unidade_medida}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {quantidadeExtraTexto}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {Math.round(contagem.quantidade_total)} {produto?.unidade_conteudo}
                              </Badge>
                            </TableCell>
                            <TableCell>{contagem.responsavel || '-'}</TableCell>
                            <TableCell>
                              {new Date(contagem.data_contagem).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteContagem(contagem.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
