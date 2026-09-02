import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Printer, Search, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Product, StorageLocation } from "@/types/product";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onUpdateAbertura?: (id: string, data: Date) => void;
  onPrintLabel?: (product: Product) => void;
  title?: string;
  category?: StorageLocation;
}

const statusConfig = {
  'valido': { label: 'Válido', className: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
  'proximo-vencimento': { label: 'Próx. Venc.', className: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  'vencido': { label: 'Vencido', className: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const categoryLabels: Record<string, string> = {
  'refrigerado': 'Refrigerado',
  'congelado': 'Congelado',
  'ambiente': 'Ambiente',
  'camara-fria': 'Câmara Fria',
};

export function ProductTable({
  products, onEdit, onDelete, onUpdateAbertura, onPrintLabel,
  title = "Produtos", category
}: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("nome");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const safeGetDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    try {
      if (typeof dateValue === 'object' && dateValue._type === 'Date' && dateValue.value?.iso) {
        const date = new Date(dateValue.value.iso);
        return isNaN(date.getTime()) ? null : date;
      }
      if (dateValue instanceof Date) return isNaN(dateValue.getTime()) ? null : dateValue;
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    } catch { return null; }
  };

  const formatDate = (dateValue: any): string => {
    const date = safeGetDate(dateValue);
    if (!date) return '-';
    try { return format(date, "dd/MM/yyyy", { locale: ptBR }); } catch { return '-'; }
  };

  const filteredProducts = products
    .filter(product => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = product.nome.toLowerCase().includes(term) ||
        product.lote.toLowerCase().includes(term) ||
        product.marca.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'nome': return a.nome.localeCompare(b.nome);
        case 'validade': {
          const aD = safeGetDate(a.validade), bD = safeGetDate(b.validade);
          if (!aD && !bD) return 0;
          if (!aD) return 1;
          if (!bD) return -1;
          return aD.getTime() - bD.getTime();
        }
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm animate-fade-in">
      <div className="border-b border-border/60 bg-gradient-to-b from-muted/20 to-transparent p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold tracking-tight text-foreground">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Gerencie validade, status e etiquetas dos produtos</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground sm:inline-flex">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto, lote ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 border-border/70 bg-background pl-9 text-sm shadow-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 border-border/70 bg-background text-sm shadow-none sm:h-9 sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="valido">Válidos</SelectItem>
                <SelectItem value="proximo-vencimento">Próx. vencimento</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 border-border/70 bg-background text-sm shadow-none sm:h-9 sm:w-36">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nome">Nome</SelectItem>
                <SelectItem value="validade">Validade</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 bg-muted/20 hover:bg-muted/20">
              {['Produto','Lote','Marca','Fabricação','Validade','Abertura','Usar Até',...(category ? [] : ['Local']),'Responsável','Status','Ações'].map((head) => (
                <TableHead key={head} className="h-10 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{head}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const status = statusConfig[product.status];
              return (
                <TableRow key={product.id} className="border-border/30 transition-colors hover:bg-primary/[0.025]">
                  <TableCell className="py-3 font-medium text-sm text-foreground">{product.nome}</TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{product.lote}</TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{product.marca}</TableCell>
                  <TableCell className="py-3 text-sm tabular-nums text-muted-foreground">{formatDate(product.dataFabricacao)}</TableCell>
                  <TableCell className="py-3 text-sm tabular-nums font-medium text-foreground">{formatDate(product.validade)}</TableCell>
                  <TableCell className="py-3 text-sm tabular-nums text-muted-foreground">{formatDate(product.dataAbertura)}</TableCell>
                  <TableCell className="py-3 text-sm tabular-nums text-muted-foreground">{formatDate(product.utilizarAte)}</TableCell>
                  {!category && <TableCell className="py-3"><span className="inline-flex rounded-md border border-border/50 bg-muted/60 px-2 py-1 text-[10px] font-medium text-muted-foreground">{categoryLabels[product.localArmazenamento]}</span></TableCell>}
                  <TableCell className="py-3 text-sm text-muted-foreground">{product.responsavel}</TableCell>
                  <TableCell className="py-3">
                    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold", status.className)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />{status.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-background p-0.5 shadow-sm w-fit">
                      {onEdit && <Button variant="ghost" size="icon" aria-label="Editar produto" className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(product)}><Edit className="h-3.5 w-3.5" /></Button>}
                      {onPrintLabel && <Button variant="ghost" size="icon" aria-label="Imprimir etiqueta" className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary" onClick={() => onPrintLabel(product)}><Printer className="h-3.5 w-3.5" /></Button>}
                      {onDelete && <Button variant="ghost" size="icon" aria-label="Excluir produto" className="h-7 w-7 rounded-md text-destructive/70 hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(product.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden">
        {filteredProducts.map((product) => {
          const isExpanded = expandedId === product.id;
          const status = statusConfig[product.status];
          return (
            <div key={product.id} className={cn("border-b border-border/30 last:border-0 transition-colors", isExpanded ? "bg-muted/20" : "hover:bg-muted/10")}>
              <div className="flex cursor-pointer items-center gap-3 p-4 active:bg-muted/30" onClick={() => setExpandedId(isExpanded ? null : product.id)}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-xs">{product.nome.charAt(0).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold text-foreground">{product.nome}</h4>
                    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold", status.className)}><span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />{status.label}</span>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{product.marca} · Lote: {product.lote}{!category && ` · ${categoryLabels[product.localArmazenamento]}`}</p>
                </div>
                <div className="shrink-0 rounded-md p-1 text-muted-foreground">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="mb-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/50 bg-border/50">
                    {[['Fabricação', formatDate(product.dataFabricacao)],['Validade', formatDate(product.validade)],['Abertura', formatDate(product.dataAbertura)],['Usar Até', formatDate(product.utilizarAte)]].map(([label, value]) => (
                      <div key={label} className="bg-card p-3">
                        <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                        <span className="text-xs font-medium tabular-nums text-foreground">{value}</span>
                      </div>
                    ))}
                    <div className="col-span-2 bg-card p-3">
                      <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Responsável</span>
                      <span className="text-xs font-medium text-foreground">{product.responsavel || '-'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onEdit && <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="h-9 flex-1 text-xs"><Edit className="mr-1.5 h-3.5 w-3.5" />Editar</Button>}
                    {onPrintLabel && <Button size="sm" onClick={() => onPrintLabel(product)} className="h-9 flex-1 text-xs"><Printer className="mr-1.5 h-3.5 w-3.5" />Imprimir</Button>}
                    {onDelete && <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="h-9 w-9 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="border-t border-border/40 px-4 py-16 text-center text-muted-foreground">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground/50"><Search className="h-5 w-5" /></div>
          <p className="text-sm font-semibold text-foreground">Nenhum produto encontrado</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Tente ajustar o termo ou os filtros de busca.</p>
        </div>
      )}
    </div>
  );
}
