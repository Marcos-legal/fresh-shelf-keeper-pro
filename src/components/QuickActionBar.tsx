import { 
  Plus, 
  FileText, 
  Printer, 
  Download, 
  Upload, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Settings
} from "lucide-react";
import { ActionableIcon } from "./ActionableIcon";
import { Card } from "@/components/ui/card";
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
  onNewProduct,
  totalProducts,
  expiredCount,
  expiringCount,
  onRefresh,
  onExport,
  onImport
}: QuickActionBarProps) {
  const navigate = useNavigate();

  const handleQuickReport = () => {
    navigate('/relatorios');
    toast({
      title: "Relatórios",
      description: "Redirecionando para área de relatórios...",
    });
  };

  const handleQuickPrint = () => {
    navigate('/impressao-etiquetas');
    toast({
      title: "Impressão",
      description: "Redirecionando para impressão de etiquetas...",
    });
  };

  const handleQuickSettings = () => {
    toast({
      title: "Configurações",
      description: "Funcionalidade em desenvolvimento...",
    });
  };

  const handleQuickSearch = () => {
    toast({
      title: "Busca Avançada",
      description: "Funcionalidade em desenvolvimento...",
    });
  };

  const handleQuickFilter = () => {
    toast({
      title: "Filtros",
      description: "Funcionalidade em desenvolvimento...",
    });
  };

  return (
    <Card className="p-3 sm:p-4 mb-4 sm:mb-6 animate-fade-in">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-foreground">Ações Rápidas</h3>
          <div className="flex items-center space-x-1">
            <ActionableIcon
              icon={Plus}
              label="Novo Produto"
              onClick={onNewProduct}
              variant="default"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            />
            <ActionableIcon
              icon={Printer}
              label="Impressão Rápida"
              onClick={handleQuickPrint}
              variant="outline"
            />
            <ActionableIcon
              icon={FileText}
              label="Relatórios"
              onClick={handleQuickReport}
              variant="outline"
            />
            <Separator orientation="vertical" className="h-8 mx-2" />
            <ActionableIcon
              icon={Search}
              label="Busca Avançada"
              onClick={handleQuickSearch}
              variant="ghost"
            />
            <ActionableIcon
              icon={Filter}
              label="Filtros"
              onClick={handleQuickFilter}
              variant="ghost"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {onExport && (
              <ActionableIcon
                icon={Download}
                label="Exportar Dados"
                onClick={onExport}
                variant="outline"
              />
            )}
            {onImport && (
              <ActionableIcon
                icon={Upload}
                label="Importar Dados"
                onClick={onImport}
                variant="outline"
              />
            )}
            <Separator orientation="vertical" className="h-8 mx-2" />
            <ActionableIcon
              icon={AlertTriangle}
              label={`${expiredCount} produtos vencidos`}
              onClick={() => navigate('/relatorios')}
              variant="ghost"
              badge={expiredCount}
              pulse={expiredCount > 0}
              className={expiredCount > 0 ? "text-destructive hover:text-destructive" : ""}
            />
            <ActionableIcon
              icon={CheckCircle}
              label={`${expiringCount} produtos próximos ao vencimento`}
              onClick={() => navigate('/relatorios')}
              variant="ghost"
              badge={expiringCount}
              pulse={expiringCount > 0}
              className={expiringCount > 0 ? "text-warning hover:text-warning" : ""}
            />
            <Separator orientation="vertical" className="h-8 mx-2" />
            <ActionableIcon
              icon={RefreshCw}
              label="Atualizar Dados"
              onClick={onRefresh}
              variant="ghost"
            />
            <ActionableIcon
              icon={Settings}
              label="Configurações"
              onClick={handleQuickSettings}
              variant="ghost"
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">Ações Rápidas</h3>
          <div className="flex items-center gap-1">
            {expiredCount > 0 && (
              <ActionableIcon
                icon={AlertTriangle}
                label={`${expiredCount} vencidos`}
                onClick={() => navigate('/relatorios')}
                variant="ghost"
                badge={expiredCount}
                pulse
                className="text-destructive hover:text-destructive h-8 w-8"
              />
            )}
            {expiringCount > 0 && (
              <ActionableIcon
                icon={CheckCircle}
                label={`${expiringCount} próx. venc.`}
                onClick={() => navigate('/relatorios')}
                variant="ghost"
                badge={expiringCount}
                pulse
                className="text-warning hover:text-warning h-8 w-8"
              />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <ActionableIcon
            icon={Plus}
            label="Novo"
            onClick={onNewProduct}
            variant="default"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-10 w-full"
          />
          <ActionableIcon
            icon={Printer}
            label="Imprimir"
            onClick={handleQuickPrint}
            variant="outline"
            className="h-10 w-full"
          />
          <ActionableIcon
            icon={FileText}
            label="Relatórios"
            onClick={handleQuickReport}
            variant="outline"
            className="h-10 w-full"
          />
          <ActionableIcon
            icon={RefreshCw}
            label="Atualizar"
            onClick={onRefresh}
            variant="outline"
            className="h-10 w-full"
          />
        </div>
      </div>
    </Card>
  );
}