import { useState } from "react";
import { Plus, Printer, FileText, Download, Upload, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onNewProduct, onQuickPrint, onReports, onExport, onImport, onSettings
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Plus, label: "Novo Produto", onClick: onNewProduct },
    { icon: Printer, label: "Impressão", onClick: onQuickPrint },
    { icon: FileText, label: "Relatórios", onClick: onReports },
    { icon: Download, label: "Exportar", onClick: onExport },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <div className={cn(
        "flex flex-col-reverse space-y-reverse space-y-2 mb-3 transition-all duration-200",
        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <div
            key={action.label}
            className={cn(
              "transition-all duration-200",
              isOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            )}
            style={{ transitionDelay: isOpen ? `${index * 40}ms` : '0ms' }}
          >
            <Button
              size="lg"
              onClick={() => handleActionClick(action)}
              className="w-11 h-11 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-card text-foreground border border-border/60 hover:bg-accent group"
            >
              <action.icon className="w-4 h-4" />
              <span className="sr-only">{action.label}</span>
              <div className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-foreground text-background px-2.5 py-1 rounded-lg text-xs whitespace-nowrap font-medium">
                  {action.label}
                </div>
              </div>
            </Button>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all duration-200",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </Button>

      {isOpen && <div className="fixed inset-0 -z-10" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
