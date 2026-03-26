import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Printer, Search, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { Product, StorageLocation } from "@/types/product";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  'valido': { label: 'Válido', className: 'bg-success/10 text-success border-success/20' },
  'proximo-vencimento': { label: 'Próx. Venc.', className: 'bg-warning/10 text-warning border-warning/20' },
  'vencido': { label: 'Vencido', className: 'bg-destructive/10 text-destructive border-destructive/20' },
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
      if (typeof dateValue === 'object' && dateValue._type === 'Date') {
        if (dateValue.value?.iso) {
          const date = new Date(dateValue.value.iso);
          return isNaN(date.getTime()) ? null : date;
        }
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
      const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.marca.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'nome': return a.nome.localeCompare(b.nome);
        case 'validade':
          const aD = safeGetDate(a.validade), bD = safeGetDate(b.validade);
          if (!aD && !bD) return 0;
          if (!aD) return 1;
          if (!bD) return -1;
          return aD.getTime() - bD.getTime();
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  return (
    <div className="bg-card rounded-xl border border-border/60 animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border/40">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-[11px] text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-full font-medium tabular-nums">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Filters - stack on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 sm:h-9 text-sm bg-background"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 sm:w-40 h-10 sm:h-9 text-sm bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="valido">Válidos</SelectItem>
                <SelectItem value="proximo-vencimento">Próx. vencimento</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1 sm:w-36 h-10 sm:h-9 text-sm bg-background">
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
      
      {/* Desktop Table - hidden below lg */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Produto</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Lote</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Marca</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Fabricação</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Validade</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Abertura</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Usar Até</TableHead>
              {!category && <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Local</TableHead>}
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Responsável</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="border-border/20 hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">{product.nome}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{product.lote}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{product.marca}</TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">{formatDate(product.dataFabricacao)}</TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">{formatDate(product.validade)}</TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">{formatDate(product.dataAbertura)}</TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">{formatDate(product.utilizarAte)}</TableCell>
                {!category && (
                  <TableCell>
                    <span className="text-[11px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md">
                      {categoryLabels[product.localArmazenamento]}
                    </span>
                  </TableCell>
                )}
                <TableCell className="text-sm text-muted-foreground">{product.responsavel}</TableCell>
                <TableCell>
                  <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full border", statusConfig[product.status].className)}>
                    {statusConfig[product.status].label}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {onEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(product)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {onPrintLabel && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => onPrintLabel(product)}>
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(product.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards - shown below lg */}
      <div className="lg:hidden">
        {filteredProducts.map((product) => {
          const isExpanded = expandedId === product.id;
          return (
            <div 
              key={product.id} 
              className={cn(
                "border-b border-border/20 last:border-0 transition-colors",
                isExpanded ? "bg-muted/20" : "hover:bg-muted/10"
              )}
            >
              {/* Card header - always visible */}
              <div 
                className="flex items-center gap-3 p-4 cursor-pointer active:bg-muted/30"
                onClick={() => setExpandedId(isExpanded ? null : product.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-semibold text-sm text-foreground truncate">{product.nome}</h4>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0", statusConfig[product.status].className)}>
                      {statusConfig[product.status].label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {product.marca} · Lote: {product.lote}
                    {!category && ` · ${categoryLabels[product.localArmazenamento]}`}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded 
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
              </div>

              {/* Expandable details */}
              {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3 mb-3 bg-muted/30 rounded-lg p-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-0.5">Fabricação</span>
                      <span className="text-xs font-medium tabular-nums">{formatDate(product.dataFabricacao)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-0.5">Validade</span>
                      <span className="text-xs font-medium tabular-nums">{formatDate(product.validade)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-0.5">Abertura</span>
                      <span className="text-xs font-medium tabular-nums">{formatDate(product.dataAbertura)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-0.5">Usar Até</span>
                      <span className="text-xs font-medium tabular-nums">{formatDate(product.utilizarAte)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-0.5">Responsável</span>
                      <span className="text-xs font-medium">{product.responsavel || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="flex-1 h-9 text-xs">
                        <Edit className="w-3.5 h-3.5 mr-1.5" />Editar
                      </Button>
                    )}
                    {onPrintLabel && (
                      <Button size="sm" onClick={() => onPrintLabel(product)} className="flex-1 h-9 text-xs">
                        <Printer className="w-3.5 h-3.5 mr-1.5" />Imprimir
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="h-9 w-9 text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium">Nenhum produto encontrado</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  );
}
