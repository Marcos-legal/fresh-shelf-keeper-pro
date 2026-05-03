
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  id: string;
}

export function DatePickerField({
  label,
  value,
  onChange,
  error,
  required = false,
  id
}: DatePickerFieldProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Garantir que a data seja exatamente a selecionada, sem ajustes de timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      
      onChange(dateString);
      setCalendarOpen(false);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Selecionar data';
    try {
      // Criar data usando os componentes para evitar problemas de timezone
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getSelectedDate = () => {
    if (!value) return undefined;
    try {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    } catch {
      return undefined;
    }
  };

  const handleClear = () => {
    onChange('');
    setCalendarOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <div className="relative w-full">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                value && "pr-8",
                error && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateForDisplay(value)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={getSelectedDate()}
              onSelect={handleDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 hover:opacity-100 flex items-center justify-center z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
