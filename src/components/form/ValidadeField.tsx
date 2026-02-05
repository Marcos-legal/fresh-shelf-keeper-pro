import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ValidadeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const meses = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

export function ValidadeField({
  label,
  value,
  onChange,
  error,
  required = false,
}: ValidadeFieldProps) {
  const [formato, setFormato] = useState<'DD/MM/AAAA' | 'MM/AAAA' | 'MES/ANO'>('DD/MM/AAAA');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleFormatoChange = (novoFormato: 'DD/MM/AAAA' | 'MM/AAAA' | 'MES/ANO') => {
    setFormato(novoFormato);
    onChange(''); // Limpa o valor quando muda o formato
  };

  const handleInputChange = (inputValue: string) => {
    if (formato === 'MES/ANO') {
      // Para formato MES/ANO, permitir texto livre mas converter para maiúsculo
      const upperValue = inputValue.toUpperCase();
      onChange(upperValue);
      return;
    }

    let formattedValue = inputValue.replace(/\D/g, ''); // Remove não dígitos
    
    if (formato === 'DD/MM/AAAA') {
      // Formato DD/MM/AAAA
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
      if (formattedValue.length >= 5) {
        formattedValue = formattedValue.substring(0, 5) + '/' + formattedValue.substring(5, 9);
      }
    } else {
      // Formato MM/AAAA
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 6);
      }
    }
    
    onChange(formattedValue);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      let formattedDate = '';
      
      if (formato === 'DD/MM/AAAA') {
        formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });
      } else if (formato === 'MM/AAAA') {
        formattedDate = format(date, "MM/yyyy", { locale: ptBR });
      } else if (formato === 'MES/ANO') {
        const mesNome = meses[date.getMonth()];
        const ano = date.getFullYear();
        formattedDate = `${mesNome}/${ano}`;
      }
      
      onChange(formattedDate);
      setCalendarOpen(false);
    }
  };

  const handleClearDate = () => {
    onChange('');
    setCalendarOpen(false);
  };

  const getPlaceholder = () => {
    switch (formato) {
      case 'DD/MM/AAAA':
        return "30/10/2025";
      case 'MM/AAAA':
        return "10/2025";
      case 'MES/ANO':
        return "NOVEMBRO/2025";
      default:
        return "";
    }
  };

  const getMaxLength = () => {
    switch (formato) {
      case 'DD/MM/AAAA':
        return 10;
      case 'MM/AAAA':
        return 7;
      case 'MES/ANO':
        return 20;
      default:
        return undefined;
    }
  };

  const parseValueToDate = () => {
    if (!value || value.trim() === '') return undefined;
    
    try {
      if (formato === 'DD/MM/AAAA' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      
      if (formato === 'MM/AAAA' && /^\d{2}\/\d{4}$/.test(value)) {
        const [month, year] = value.split('/').map(Number);
        return new Date(year, month - 1, 1);
      }
      
      if (formato === 'MES/ANO' && /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]+\/\d{4}$/.test(value)) {
        const [mesTexto, anoTexto] = value.split('/');
        const mesIndex = meses.indexOf(mesTexto.toUpperCase());
        if (mesIndex !== -1) {
          const ano = parseInt(anoTexto);
          return new Date(ano, mesIndex, 1);
        }
      }
    } catch (error) {
      console.warn('Erro ao parsear valor para data:', value, error);
    }
    
    return undefined;
  };

  // Helper function to display formatted value
  const getDisplayValue = () => {
    if (!value) return '';
    
    // If value is ISO (YYYY-MM-DD) and we are not in that mode, try to convert it for display
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      
      if (formato === 'DD/MM/AAAA') {
        return format(date, "dd/MM/yyyy");
      } else if (formato === 'MM/AAAA') {
        return format(date, "MM/yyyy");
      } else if (formato === 'MES/ANO') {
        return `${meses[date.getMonth()]}/${date.getFullYear()}`;
      }
    }
    
    return value;
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      
      <div className="flex space-x-2">
        <Select value={formato} onValueChange={handleFormatoChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DD/MM/AAAA">DD/MM/AAAA</SelectItem>
            <SelectItem value="MM/AAAA">MM/AAAA</SelectItem>
            <SelectItem value="MES/ANO">MÊS/ANO</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          value={getDisplayValue()}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={getPlaceholder()}
          className={error ? 'border-destructive flex-1' : 'flex-1'}
          maxLength={getMaxLength()}
        />
        
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "px-3",
                error && "border-destructive"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Selecionar Data</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearDate}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={parseValueToDate()}
                onSelect={handleDateSelect}
                locale={ptBR}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {formato === 'MES/ANO' && (
        <p className="text-xs text-muted-foreground">
          Exemplo: NOVEMBRO/2025, DEZEMBRO/2024, etc.
        </p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Digite manualmente ou use o calendário para selecionar a data
      </p>
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
