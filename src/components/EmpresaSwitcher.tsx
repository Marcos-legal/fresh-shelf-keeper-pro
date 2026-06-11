import { useEmpresa } from "@/contexts/EmpresaContext";
import { Building2, Check, ChevronsUpDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function EmpresaSwitcher({ compact = false }: { compact?: boolean }) {
  const { empresas, activeEmpresa, setActiveEmpresaId, loading } = useEmpresa();

  if (loading || empresas.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-between gap-2 h-9 px-2.5",
            compact && "h-8 text-xs"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate text-left font-medium">
              {activeEmpresa?.nome ?? "Selecionar empresa"}
            </span>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Empresas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {empresas.map((empresa) => (
          <DropdownMenuItem
            key={empresa.id}
            onClick={() => setActiveEmpresaId(empresa.id)}
            className="cursor-pointer"
          >
            <Check className={cn("mr-2 h-4 w-4", empresa.id === activeEmpresa?.id ? "opacity-100" : "opacity-0")} />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="truncate text-sm">{empresa.nome}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{empresa.role}</span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/configuracoes/empresa" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações da Empresa</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
