import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProdutoEstoqueForm } from "@/components/ProdutoEstoqueForm";
import { ContagemEstoqueForm } from "@/components/ContagemEstoqueForm";
import { ExportarEstoque } from "@/components/ExportarEstoque";
import { useEstoque } from "@/hooks/useEstoque";
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
    getEstoqueAtual
  } = useEstoque();

  const [showProdutoForm, setShowProdutoForm] = useState(false);
  const [showContagemForm, setShowContagemForm] = useState(false);

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
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold gradient-text">Contagem de Estoque</h1>
            <div className="flex space-x-2">
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

          {/* Produtos Cadastrados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Produtos Cadastrados</span>
                <Badge variant="secondary">{produtos.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {produtos.length === 0 ? (
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
                    {produtos.map((produto) => {
                      const estoqueAtual = getEstoqueAtual(produto.id);
                      return (
                        <TableRow key={produto.id}>
                          <TableCell className="font-medium">{produto.nome}</TableCell>
                          <TableCell>{produto.unidadeMedida}</TableCell>
                          <TableCell>
                            {produto.quantidadePorUnidade} {produto.unidadeConteudo}
                          </TableCell>
                          <TableCell>
                            <Badge variant={estoqueAtual > 0 ? "default" : "secondary"}>
                              {estoqueAtual} {produto.unidadeConteudo}
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
                <Badge variant="secondary">{contagens.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contagens.length === 0 ? (
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
                    {contagens
                      .sort((a, b) => new Date(b.dataContagem).getTime() - new Date(a.dataContagem).getTime())
                      .map((contagem) => {
                        const produto = produtos.find(p => p.id === contagem.produtoId);
                        const quantidadeExtraTexto = contagem.quantidadeExtra > 0 ? 
                          `${contagem.quantidadeExtra} ${contagem.unidadeQuantidadeExtra === 'porcoes' ? 
                            produto?.unidadeConteudo : 'un. ind.'}` : '-';
                        
                        return (
                          <TableRow key={contagem.id}>
                            <TableCell className="font-medium">
                              {produto?.nome || 'Produto removido'}
                            </TableCell>
                            <TableCell>
                              {contagem.quantidade} {produto?.unidadeMedida}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {quantidadeExtraTexto}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {contagem.quantidadeTotal.toFixed(2)} {produto?.unidadeConteudo}
                              </Badge>
                            </TableCell>
                            <TableCell>{contagem.responsavel || '-'}</TableCell>
                            <TableCell>
                              {contagem.dataContagem.toLocaleDateString('pt-BR', {
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
        </main>
      </div>
    </SidebarProvider>
  );
}
