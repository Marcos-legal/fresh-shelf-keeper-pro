import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter 
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface MobileFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: Array<{
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  onReset?: () => void;
  activeFiltersCount?: number;
}

export function MobileFilters({
  searchTerm,
  onSearchChange,
  filters,
  onReset,
  activeFiltersCount = 0
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onSearchChange("");
    filters.forEach(filter => filter.onChange("all"));
    onReset?.();
  };

  return (
    <div className="flex gap-2 p-4 bg-background/95 backdrop-blur sticky top-0 z-10 border-b">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-10 touch-manipulation"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 px-3 touch-manipulation relative">
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label className="text-sm font-medium">{filter.label}</Label>
                <Select value={filter.value} onValueChange={filter.onChange}>
                  <SelectTrigger className="h-12 touch-manipulation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="h-12 touch-manipulation"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1 h-12">
              Limpar Filtros
            </Button>
            <Button onClick={() => setIsOpen(false)} className="flex-1 h-12">
              Aplicar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}