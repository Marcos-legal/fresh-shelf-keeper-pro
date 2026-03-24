
import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Printer, Search } from "lucide-react";
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
  'valido': { label: 'Válido', className: 'bg-success/10 text-success border-success/20' },
  'proximo-vencimento': { label: 'Próx. Venc.', className: 'bg-warning/10 text-warning border-warning/20' },
  'vencido': { label: 'Vencido', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const categoryLabels = {
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
    <div className="bg-card rounded-xl border border-border/60 animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {filteredProducts.length} produtos
          </span>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
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
            <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
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
      
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground">Produto</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Lote</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Marca</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Fabricação</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Validade</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Abertura</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Usar Até</TableHead>
              {!category && <TableHead className="text-xs font-medium text-muted-foreground">Local</TableHead>}
              <TableHead className="text-xs font-medium text-muted-foreground">Responsável</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">{product.nome}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{product.lote}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{product.marca}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(product.dataFabricacao)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(product.validade)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(product.dataAbertura)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(product.utilizarAte)}</TableCell>
                {!category && (
                  <TableCell>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {categoryLabels[product.localArmazenamento]}
                    </span>
                  </TableCell>
                )}
                <TableCell className="text-sm text-muted-foreground">{product.responsavel}</TableCell>
                <TableCell>
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", statusConfig[product.status].className)}>
                    {statusConfig[product.status].label}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {onEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(product)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {onPrintLabel && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPrintLabel(product)}>
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(product.id)}>
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

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-border/30">
        {filteredProducts.map((product) => (
          <div key={product.id} className="p-4 hover:bg-muted/20 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate">{product.nome}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Lote: {product.lote} · {product.marca}</p>
              </div>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border ml-2 flex-shrink-0", statusConfig[product.status].className)}>
                {statusConfig[product.status].label}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
              <div><span className="text-muted-foreground">Validade:</span> <span className="font-medium">{formatDate(product.validade)}</span></div>
              <div><span className="text-muted-foreground">Usar até:</span> <span className="font-medium">{formatDate(product.utilizarAte)}</span></div>
              {!category && <div className="col-span-2"><span className="text-muted-foreground">Local:</span> <span className="font-medium">{categoryLabels[product.localArmazenamento]}</span></div>}
            </div>
            
            <div className="flex gap-1.5">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="flex-1 h-8 text-xs">
                  <Edit className="w-3 h-3 mr-1" />Editar
                </Button>
              )}
              {onPrintLabel && (
                <Button size="sm" onClick={() => onPrintLabel(product)} className="flex-1 h-8 text-xs">
                  <Printer className="w-3 h-3 mr-1" />Imprimir
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)} className="h-8 w-8 p-0 text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}
