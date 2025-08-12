import { useState } from "react";
import { Plus, Printer, FileText, Download, Upload, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionableIcon } from "./ActionableIcon";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onNewProduct: () => void;
  onQuickPrint: () => void;
  onReports: () => void;
  onExport: () => void;
  onImport: () => void;
  onSettings: () => void;
}

export function FloatingActionButton({
  onNewProduct,
  onQuickPrint,
  onReports,
  onExport,
  onImport,
  onSettings
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Plus, label: "Novo Produto", onClick: onNewProduct, color: "bg-gradient-to-r from-primary to-primary/80" },
    { icon: Printer, label: "Impressão", onClick: onQuickPrint, color: "bg-gradient-to-r from-blue-500 to-blue-600" },
    { icon: FileText, label: "Relatórios", onClick: onReports, color: "bg-gradient-to-r from-green-500 to-green-600" },
    { icon: Download, label: "Exportar", onClick: onExport, color: "bg-gradient-to-r from-purple-500 to-purple-600" },
    { icon: Upload, label: "Importar", onClick: onImport, color: "bg-gradient-to-r from-orange-500 to-orange-600" },
    { icon: Settings, label: "Configurações", onClick: onSettings, color: "bg-gradient-to-r from-gray-500 to-gray-600" },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu de ações */}
      <div className={cn(
        "flex flex-col-reverse space-y-reverse space-y-3 mb-4 transition-all duration-300",
        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"
      )}>
        {actions.map((action, index) => (
          <div
            key={action.label}
            className={cn(
              "transition-all duration-300 delay-75",
              isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
            style={{ 
              transitionDelay: isOpen ? `${index * 50}ms` : `${(actions.length - index) * 50}ms`
            }}
          >
            <Button
              size="lg"
              onClick={() => handleActionClick(action)}
              className={cn(
                "w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group",
                action.color,
                "text-white border-2 border-white/20"
              )}
            >
              <action.icon className="w-6 h-6" />
              <span className="sr-only">{action.label}</span>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                  {action.label}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-black/80"></div>
                </div>
              </div>
            </Button>
          </div>
        ))}
      </div>

      {/* Botão principal */}
      <Button
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl transition-all duration-300",
          "bg-gradient-to-r from-primary via-primary/90 to-primary/80",
          "hover:shadow-3xl hover:scale-110 active:scale-95",
          "border-4 border-white/20 text-white",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? (
          <X className="w-8 h-8 transition-transform duration-300" />
        ) : (
          <Plus className="w-8 h-8 transition-transform duration-300" />
        )}
      </Button>

      {/* Overlay para fechar o menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 -z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}