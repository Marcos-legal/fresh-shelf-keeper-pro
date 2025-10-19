
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Edit, Trash2, Printer, Search } from "lucide-react";
import { Product, StorageLocation } from "@/types/product";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  'valido': { label: 'Válido', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
  'proximo-vencimento': { label: 'Próximo Venc.', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
  'vencido': { label: 'Vencido', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
};

const categoryLabels = {
  'refrigerado': 'Refrigerado',
  'congelado': 'Congelado',
  'ambiente': 'Ambiente',
  'camara-fria': 'Câmara Fria',
};

export function ProductTable({ 
  products, 
  onEdit, 
  onDelete, 
  onUpdateAbertura, 
  onPrintLabel,
  title = "Produtos",
  category 
}: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("nome");

  // Filtrar e ordenar produtos
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
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'validade':
          const aDate = safeGetDate(a.validade);
          const bDate = safeGetDate(b.validade);
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return aDate.getTime() - bDate.getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const safeGetDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    try {
      // Handle complex date structure from localStorage
      if (typeof dateValue === 'object' && dateValue._type === 'Date') {
        if (dateValue.value && dateValue.value.iso) {
          const date = new Date(dateValue.value.iso);
          return isNaN(date.getTime()) ? null : date;
        }
      }
      
      // Handle direct Date objects
      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
      }
      
      // Handle string dates
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      }
      
      return null;
    } catch (error) {
      console.warn('Error parsing date:', dateValue, error);
      return null;
    }
  };

  const formatDate = (dateValue: any): string => {
    const date = safeGetDate(dateValue);
    if (!date) return '-';
    
    try {
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.warn('Error formatting date:', dateValue, error);
      return '-';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-lg sm:text-xl">{title}</span>
          <Badge variant="outline" className="text-xs sm:text-sm w-fit">
            {filteredProducts.length} produtos
          </Badge>
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
          <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="valido">Válidos</SelectItem>
              <SelectItem value="proximo-vencimento">Próximo vencimento</SelectItem>
              <SelectItem value="vencido">Vencidos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome">Nome</SelectItem>
              <SelectItem value="validade">Validade</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 sm:p-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Fabricação</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Utilizar Até</TableHead>
                {!category && <TableHead>Local</TableHead>}
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{product.nome}</TableCell>
                  <TableCell>{product.lote}</TableCell>
                  <TableCell>{product.marca}</TableCell>
                  <TableCell>{formatDate(product.dataFabricacao)}</TableCell>
                  <TableCell>{formatDate(product.validade)}</TableCell>
                  <TableCell>{formatDate(product.dataAbertura)}</TableCell>
                  <TableCell>{formatDate(product.utilizarAte)}</TableCell>
                  {!category && (
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[product.localArmazenamento]}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>{product.responsavel}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={statusConfig[product.status].variant}
                      className={statusConfig[product.status].color}
                    >
                      {statusConfig[product.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {onEdit && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onPrintLabel && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onPrintLabel(product)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border-l-4" style={{
              borderLeftColor: product.status === 'vencido' ? 'hsl(var(--destructive))' : 
                               product.status === 'proximo-vencimento' ? 'hsl(var(--warning))' : 
                               'hsl(var(--success))'
            }}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">{product.nome}</h3>
                    <p className="text-sm text-muted-foreground">Lote: {product.lote}</p>
                  </div>
                  <Badge 
                    variant={statusConfig[product.status].variant}
                    className={statusConfig[product.status].color + " text-xs"}
                  >
                    {statusConfig[product.status].label}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Marca:</span>
                    <p className="font-medium">{product.marca}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Validade:</span>
                    <p className="font-medium">{formatDate(product.validade)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Abertura:</span>
                    <p className="font-medium">{formatDate(product.dataAbertura)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Usar até:</span>
                    <p className="font-medium">{formatDate(product.utilizarAte)}</p>
                  </div>
                  {!category && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Local: </span>
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[product.localArmazenamento]}
                      </Badge>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Responsável:</span>
                    <p className="font-medium">{product.responsavel}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t">
                  {onEdit && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  {onPrintLabel && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onPrintLabel(product)}
                      className="flex-1"
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Imprimir
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground p-4">
            <p>Nenhum produto encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
