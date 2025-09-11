
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
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileProductList } from "@/components/mobile/MobileProductList";

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
  const isMobile = useIsMobile();

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

  // Mobile view
  if (isMobile) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">{title}</span>
            <Badge variant="outline" className="text-sm">
              {filteredProducts.length}
            </Badge>
          </CardTitle>
          
          {/* Mobile Filters */}
          <div className="space-y-3 pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 touch-manipulation"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 touch-manipulation">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="valido">Válidos</SelectItem>
                  <SelectItem value="proximo-vencimento">Próx. Venc.</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 touch-manipulation">
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
        </CardHeader>
        
        <MobileProductList
          products={filteredProducts}
          onEdit={onEdit}
          onDelete={onDelete}
          onPrintLabel={onPrintLabel}
          category={category}
        />
      </Card>
    );
  }

  // Desktop view
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline" className="text-sm">
            {filteredProducts.length} produtos
          </Badge>
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 pt-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
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
            <SelectTrigger className="w-48">
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
      
      <CardContent>
        <div className="overflow-x-auto">
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
                <TableRow key={product.id} className="hover:bg-gray-50">
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
                          className="text-red-600 hover:text-red-700"
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
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
