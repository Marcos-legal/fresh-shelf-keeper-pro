import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProdutoEstoqueForm } from "@/components/ProdutoEstoqueForm";
import { ContagemEstoqueForm } from "@/components/ContagemEstoqueForm";
import { ExportarEstoque } from "@/components/ExportarEstoque";
import { useEstoqueSupabase } from "@/hooks/useEstoqueSupabase";
import { EstoqueSearchFilter } from "@/components/EstoqueSearchFilter";
import { EstoqueStats } from "@/components/EstoqueStats";
import { ContagemEstoque as ContagemType } from "@/types/estoque";
import { Package, Calculator, Plus, Trash2, Download, Minus as MinusIcon, PlusIcon, Save, Pencil, X, ChevronDown, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface EditState {
  quantidade: number;
  quantidade_extra: number;
  responsavel: string;
  observacoes: string;
}

export default function ContagemEstoque() {
  const {
    produtos,
    contagens,
    loading,
    addProdutoEstoque,
    deleteProdutoEstoque,
    addContagem,
    updateContagem,
    deleteContagem,
    getEstoqueAtual,
    migrarDadosLocalStorage,
    refreshData
  } = useEstoqueSupabase();

  const [showProdutoForm, setShowProdutoForm] = useState(false);
  const [showContagemForm, setShowContagemForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponsavel, setFilterResponsavel] = useState('all');
  const [editingStates, setEditingStates] = useState<Record<string, EditState>>({});
  const [showActions, setShowActions] = useState(false);
  const [historicoSearch, setHistoricoSearch] = useState('');

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

  const startEditing = (contagem: ContagemType) => {
    setEditingStates(prev => ({
      ...prev,
      [contagem.id]: {
        quantidade: contagem.quantidade,
        quantidade_extra: contagem.quantidade_extra,
        responsavel: contagem.responsavel || '',
        observacoes: contagem.observacoes || '',
      }
    }));
  };

  const cancelEditing = (id: string) => {
    setEditingStates(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateEditField = (id: string, field: keyof EditState, value: number | string) => {
    setEditingStates(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const saveEditing = async (contagem: ContagemType) => {
    const editState = editingStates[contagem.id];
    if (!editState) return;

    await updateContagem(contagem.id, {
      produto_id: contagem.produto_id,
      quantidade: Math.max(0, editState.quantidade),
      quantidade_extra: Math.max(0, editState.quantidade_extra),
      unidade_quantidade_extra: contagem.unidade_quantidade_extra,
      responsavel: editState.responsavel || undefined,
      observacoes: editState.observacoes || undefined,
    });

    cancelEditing(contagem.id);
  };

  const isEditing = (id: string) => id in editingStates;

  if (loading) {
    return (
      <PageLayout title="Contagem de Estoque" description="Carregando..." icon={Calculator}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Contagem de Estoque"
      description="Gerencie o estoque de produtos"
      icon={Calculator}
      headerActions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={migrarDadosLocalStorage} className="text-xs sm:text-sm" size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Migrar dados locais</span>
            <span className="sm:hidden">Migrar</span>
          </Button>
          <ExportarEstoque produtos={produtos} contagens={contagens} getEstoqueAtual={getEstoqueAtual} />
          <Dialog open={showProdutoForm} onOpenChange={setShowProdutoForm}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground text-xs sm:text-sm" size="sm">
                <Package className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Cadastrar Produto</span>
                <span className="sm:hidden">Produto</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Cadastrar Produto para Estoque</DialogTitle></DialogHeader>
              <ProdutoEstoqueForm onSubmit={(data) => { addProdutoEstoque(data); setShowProdutoForm(false); }} />
            </DialogContent>
          </Dialog>
          {produtos.length > 0 && (
            <Dialog open={showContagemForm} onOpenChange={setShowContagemForm}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/5 text-xs sm:text-sm" size="sm">
                  <Calculator className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Nova Contagem</span>
                  <span className="sm:hidden">Contagem</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Nova Contagem de Estoque</DialogTitle></DialogHeader>
                <ContagemEstoqueForm produtos={produtos} onSubmit={addContagem} onClose={() => setShowContagemForm(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        <EstoqueStats produtos={produtos} contagens={contagens} getEstoqueAtual={getEstoqueAtual} />
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
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Produtos Cadastrados</span>
              <Badge variant="secondary" className="text-xs">{filteredProdutos.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {filteredProdutos.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/40 mb-3 sm:mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Nenhum produto cadastrado para estoque</p>
                <Button onClick={() => setShowProdutoForm(true)} className="gradient-blue text-white" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Produto
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Produto</TableHead>
                        <TableHead className="text-xs">Unidade</TableHead>
                        <TableHead className="text-xs">Qtd por Unidade</TableHead>
                        <TableHead className="text-xs">Estoque Atual</TableHead>
                        <TableHead className="text-xs w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProdutos.map((produto) => {
                        const estoqueAtual = getEstoqueAtual(produto.id);
                        return (
                          <TableRow key={produto.id}>
                            <TableCell className="font-medium text-sm">{produto.nome}</TableCell>
                            <TableCell className="text-sm">{produto.unidade_medida}</TableCell>
                            <TableCell className="text-sm">{produto.quantidade_por_unidade} {produto.unidade_conteudo}</TableCell>
                            <TableCell>
                              <Badge variant={estoqueAtual > 0 ? "default" : "secondary"} className="text-xs">
                                {estoqueAtual} {produto.unidade_conteudo}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => deleteProdutoEstoque(produto.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border">
                  {filteredProdutos.map((produto) => {
                    const estoqueAtual = getEstoqueAtual(produto.id);
                    return (
                      <div key={produto.id} className="p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm text-foreground">{produto.nome}</h4>
                          <Button variant="destructive" size="sm" className="h-8 w-8 p-0 flex-shrink-0 ml-2" onClick={() => deleteProdutoEstoque(produto.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Unidade:</span> <span className="font-medium">{produto.unidade_medida}</span></div>
                          <div><span className="text-muted-foreground">Qtd/Un:</span> <span className="font-medium">{produto.quantidade_por_unidade} {produto.unidade_conteudo}</span></div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Estoque:</span>{' '}
                            <Badge variant={estoqueAtual > 0 ? "default" : "secondary"} className="text-xs ml-1">{estoqueAtual} {produto.unidade_conteudo}</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Contagens */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Histórico de Contagens</span>
              <Badge variant="secondary" className="text-xs">{filteredContagens.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {filteredContagens.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Calculator className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma contagem realizada ainda</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Produto</TableHead>
                        <TableHead className="text-xs">Qtd Principal</TableHead>
                        <TableHead className="text-xs">Qtd Extra</TableHead>
                        <TableHead className="text-xs">Total Calculado</TableHead>
                        <TableHead className="text-xs">Responsável</TableHead>
                        <TableHead className="text-xs">Observações</TableHead>
                        <TableHead className="text-xs">Data</TableHead>
                        <TableHead className="text-xs w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContagens
                        .sort((a, b) => new Date(b.data_contagem).getTime() - new Date(a.data_contagem).getTime())
                        .map((contagem) => {
                          const produto = produtos.find(p => p.id === contagem.produto_id);
                          const editing = isEditing(contagem.id);
                          const editState = editingStates[contagem.id];

                          return (
                            <TableRow key={contagem.id} className={cn(editing && "bg-primary/5 ring-1 ring-primary/20")}>
                              <TableCell className="font-medium text-sm">{produto?.nome || 'Produto removido'}</TableCell>
                              <TableCell>
                                {editing ? (
                                  <div className="flex items-center gap-1">
                                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateEditField(contagem.id, 'quantidade', Math.max(0, editState.quantidade - 1))}>
                                      <MinusIcon className="w-3 h-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      className="w-16 h-7 text-center text-xs"
                                      value={editState.quantidade}
                                      onChange={e => updateEditField(contagem.id, 'quantidade', Number(e.target.value))}
                                      min={0}
                                    />
                                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateEditField(contagem.id, 'quantidade', editState.quantidade + 1)}>
                                      <PlusIcon className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-sm tabular-nums">{contagem.quantidade} {produto?.unidade_medida}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {editing ? (
                                  <div className="flex items-center gap-1">
                                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateEditField(contagem.id, 'quantidade_extra', Math.max(0, editState.quantidade_extra - 1))}>
                                      <MinusIcon className="w-3 h-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      className="w-16 h-7 text-center text-xs"
                                      value={editState.quantidade_extra}
                                      onChange={e => updateEditField(contagem.id, 'quantidade_extra', Number(e.target.value))}
                                      min={0}
                                    />
                                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateEditField(contagem.id, 'quantidade_extra', editState.quantidade_extra + 1)}>
                                      <PlusIcon className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-sm tabular-nums">{contagem.quantidade_extra}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs tabular-nums">{Math.round(contagem.quantidade_total)} {produto?.unidade_conteudo}</Badge>
                              </TableCell>
                              <TableCell>
                                {editing ? (
                                  <Input
                                    className="h-7 text-xs w-24"
                                    value={editState.responsavel}
                                    onChange={e => updateEditField(contagem.id, 'responsavel', e.target.value)}
                                    placeholder="Responsável"
                                  />
                                ) : (
                                  <span className="text-sm">{contagem.responsavel || '-'}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {editing ? (
                                  <Input
                                    className="h-7 text-xs w-28"
                                    value={editState.observacoes}
                                    onChange={e => updateEditField(contagem.id, 'observacoes', e.target.value)}
                                    placeholder="Observações"
                                  />
                                ) : (
                                  <span className="text-sm truncate max-w-[120px] block">{contagem.observacoes || '-'}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(contagem.data_contagem).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {editing ? (
                                    <>
                                      <Button variant="default" size="sm" className="h-8 w-8 p-0" onClick={() => saveEditing(contagem)} title="Salvar">
                                        <Save className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => cancelEditing(contagem.id)} title="Cancelar">
                                        <X className="w-3.5 h-3.5" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => startEditing(contagem)} title="Editar">
                                        <Pencil className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => deleteContagem(contagem.id)} title="Excluir">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden divide-y divide-border">
                  {filteredContagens
                    .sort((a, b) => new Date(b.data_contagem).getTime() - new Date(a.data_contagem).getTime())
                    .map((contagem) => {
                      const produto = produtos.find(p => p.id === contagem.produto_id);
                      const editing = isEditing(contagem.id);
                      const editState = editingStates[contagem.id];

                      return (
                        <div key={contagem.id} className={cn("p-4 transition-colors", editing ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : "hover:bg-muted/20")}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-foreground truncate">{produto?.nome || 'Produto removido'}</h4>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {new Date(contagem.data_contagem).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                {contagem.responsavel && !editing && ` · ${contagem.responsavel}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              {editing ? (
                                <>
                                  <Button variant="default" size="sm" className="h-8 w-8 p-0" onClick={() => saveEditing(contagem)} title="Salvar">
                                    <Save className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => cancelEditing(contagem.id)} title="Cancelar">
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => startEditing(contagem)} title="Editar">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => deleteContagem(contagem.id)} title="Excluir">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {editing ? (
                            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Qtd Principal ({produto?.unidade_medida})</label>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => updateEditField(contagem.id, 'quantidade', Math.max(0, editState.quantidade - 1))}>
                                    <MinusIcon className="w-4 h-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    className="h-9 text-center flex-1"
                                    value={editState.quantidade}
                                    onChange={e => updateEditField(contagem.id, 'quantidade', Number(e.target.value))}
                                    min={0}
                                  />
                                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => updateEditField(contagem.id, 'quantidade', editState.quantidade + 1)}>
                                    <PlusIcon className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Qtd Extra</label>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => updateEditField(contagem.id, 'quantidade_extra', Math.max(0, editState.quantidade_extra - 1))}>
                                    <MinusIcon className="w-4 h-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    className="h-9 text-center flex-1"
                                    value={editState.quantidade_extra}
                                    onChange={e => updateEditField(contagem.id, 'quantidade_extra', Number(e.target.value))}
                                    min={0}
                                  />
                                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => updateEditField(contagem.id, 'quantidade_extra', editState.quantidade_extra + 1)}>
                                    <PlusIcon className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Responsável</label>
                                <Input
                                  className="h-9 text-sm"
                                  value={editState.responsavel}
                                  onChange={e => updateEditField(contagem.id, 'responsavel', e.target.value)}
                                  placeholder="Responsável"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Observações</label>
                                <Input
                                  className="h-9 text-sm"
                                  value={editState.observacoes}
                                  onChange={e => updateEditField(contagem.id, 'observacoes', e.target.value)}
                                  placeholder="Observações"
                                />
                              </div>
                              <div className="pt-1 border-t border-border/50">
                                <Badge variant="default" className="text-xs tabular-nums">Total: {Math.round(contagem.quantidade_total)} {produto?.unidade_conteudo}</Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-muted/30 rounded-lg border border-border">
                              <div><span className="text-muted-foreground">Qtd Principal:</span> <span className="font-medium tabular-nums">{contagem.quantidade} {produto?.unidade_medida}</span></div>
                              <div><span className="text-muted-foreground">Qtd Extra:</span> <span className="font-medium tabular-nums">{contagem.quantidade_extra}</span></div>
                              {contagem.observacoes && (
                                <div className="col-span-2"><span className="text-muted-foreground">Obs:</span> <span className="font-medium">{contagem.observacoes}</span></div>
                              )}
                              <div className="col-span-2 pt-1 border-t border-border/50">
                                <Badge variant="default" className="text-xs tabular-nums">Total: {Math.round(contagem.quantidade_total)} {produto?.unidade_conteudo}</Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
