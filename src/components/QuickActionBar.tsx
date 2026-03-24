import { 
  Plus, FileText, Printer, Download, Upload, RefreshCw,
  AlertTriangle, CheckCircle, Search, Filter, Settings
} from "lucide-react";
import { ActionableIcon } from "./ActionableIcon";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface QuickActionBarProps {
  onNewProduct: () => void;
  totalProducts: number;
  expiredCount: number;
  expiringCount: number;
  onRefresh: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export function QuickActionBar({
  onNewProduct, totalProducts, expiredCount, expiringCount,
  onRefresh, onExport, onImport
}: QuickActionBarProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border/60 p-3 sm:p-4 mb-6 animate-fade-in">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1">Ações</span>
          <ActionableIcon icon={Plus} label="Novo Produto" onClick={onNewProduct} variant="default" />
          <ActionableIcon icon={Printer} label="Imprimir" onClick={() => navigate('/impressao-etiquetas')} variant="outline" />
          <ActionableIcon icon={FileText} label="Relatórios" onClick={() => navigate('/relatorios')} variant="outline" />
          <Separator orientation="vertical" className="h-6 mx-1" />
          {onExport && <ActionableIcon icon={Download} label="Exportar" onClick={onExport} variant="ghost" />}
          {onImport && <ActionableIcon icon={Upload} label="Importar" onClick={onImport} variant="ghost" />}
        </div>
        <div className="flex items-center gap-1">
          {expiredCount > 0 && (
            <ActionableIcon icon={AlertTriangle} label={`${expiredCount} vencidos`} onClick={() => navigate('/relatorios')} variant="ghost" badge={expiredCount} className="text-destructive" />
          )}
          {expiringCount > 0 && (
            <ActionableIcon icon={CheckCircle} label={`${expiringCount} próx. venc.`} onClick={() => navigate('/relatorios')} variant="ghost" badge={expiringCount} className="text-warning" />
          )}
          <Separator orientation="vertical" className="h-6 mx-1" />
          <ActionableIcon icon={RefreshCw} label="Atualizar" onClick={onRefresh} variant="ghost" />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="grid grid-cols-4 gap-2">
          <ActionableIcon icon={Plus} label="Novo" onClick={onNewProduct} variant="default" className="h-9 w-full" />
          <ActionableIcon icon={Printer} label="Print" onClick={() => navigate('/impressao-etiquetas')} variant="outline" className="h-9 w-full" />
          <ActionableIcon icon={FileText} label="Relat." onClick={() => navigate('/relatorios')} variant="outline" className="h-9 w-full" />
          <ActionableIcon icon={RefreshCw} label="Atual." onClick={onRefresh} variant="outline" className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
