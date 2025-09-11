import { Product } from "@/types/product";
import { MobileCard } from "./MobileCard";
import { Badge } from "@/components/ui/badge";
import { Edit, Printer, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MobileProductListProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onPrintLabel?: (product: Product) => void;
  category?: string;
}

const statusConfig = {
  'valido': { label: 'Válido', variant: 'default' as const },
  'proximo-vencimento': { label: 'Próximo Venc.', variant: 'secondary' as const },
  'vencido': { label: 'Vencido', variant: 'destructive' as const },
};

const categoryLabels = {
  'refrigerado': 'Refrigerado',
  'congelado': 'Congelado', 
  'ambiente': 'Ambiente',
  'camara-fria': 'Câmara Fria',
};

export function MobileProductList({ 
  products, 
  onEdit, 
  onDelete, 
  onPrintLabel,
  category 
}: MobileProductListProps) {
  const safeGetDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    try {
      if (typeof dateValue === 'object' && dateValue._type === 'Date') {
        if (dateValue.value && dateValue.value.iso) {
          const date = new Date(dateValue.value.iso);
          return isNaN(date.getTime()) ? null : date;
        }
      }
      
      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
      }
      
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const formatDate = (dateValue: any): string => {
    const date = safeGetDate(dateValue);
    if (!date) return '-';
    
    try {
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return '-';
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {products.map((product) => {
        const actions = [];
        
        if (onEdit) {
          actions.push({
            label: "Editar",
            icon: <Edit className="w-4 h-4" />,
            onClick: () => onEdit(product),
          });
        }
        
        if (onPrintLabel) {
          actions.push({
            label: "Imprimir Etiqueta",
            icon: <Printer className="w-4 h-4" />,
            onClick: () => onPrintLabel(product),
          });
        }
        
        if (onDelete) {
          actions.push({
            label: "Excluir",
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => onDelete(product.id),
            variant: "destructive" as const,
          });
        }

        const badges = [
          { label: `Lote: ${product.lote}`, variant: "outline" as const },
          { label: product.marca, variant: "secondary" as const },
        ];

        if (!category) {
          badges.push({
            label: categoryLabels[product.localArmazenamento],
            variant: "outline" as const,
          });
        }

        return (
          <MobileCard
            key={product.id}
            title={product.nome}
            subtitle={`Responsável: ${product.responsavel}`}
            status={{
              label: statusConfig[product.status].label,
              variant: statusConfig[product.status].variant,
            }}
            badges={badges}
            actions={actions}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Fabricação</p>
                <p className="font-medium">{formatDate(product.dataFabricacao)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Validade</p>
                <p className="font-medium">{formatDate(product.validade)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Abertura</p>
                <p className="font-medium">{formatDate(product.dataAbertura)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Utilizar até</p>
                <p className="font-medium">{formatDate(product.utilizarAte)}</p>
              </div>
            </div>
          </MobileCard>
        );
      })}
    </div>
  );
}