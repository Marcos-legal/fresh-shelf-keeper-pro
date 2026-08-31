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

function isValidDate(date: Date, year: number, month: number, day: number) {
  return !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
}

function parseValueToDate(value: string, formato: 'DD/MM/AAAA' | 'MM/AAAA' | 'MES/ANO'): Date | undefined {
  if (!value || !value.trim()) return undefined;

  try {
    if (formato === 'DD/MM/AAAA') {
      const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
      if (!match) return undefined;
      const day = Number(match[1]);
      const month = Number(match[2]);
      let year = Number(match[3]);
      if (year < 100) year += 2000;
      const date = new Date(year, month - 1, day);
      return isValidDate(date, year, month, day) ? date : undefined;
    }

    if (formato === 'MM/AAAA') {
      const match = value.match(/^(\d{1,2})\/(\d{4})$/);
      if (!match) return undefined;
      const month = Number(match[1]);
      const year = Number(match[2]);
      if (month < 1 || month > 12) return undefined;
      const date = new Date(year, month - 1, 1);
      return isValidDate(date, year, month, 1) ? date : undefined;
    }

    const match = value.match(/^([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]+)\/(\d{4})$/i);
    if (!match) return undefined;
    const mesIndex = meses.indexOf(match[1].toUpperCase());
    const ano = Number(match[2]);
    if (mesIndex === -1 || !ano) return undefined;
    const date = new Date(ano, mesIndex, 1);
    return isValidDate(date, ano, mesIndex + 1, 1) ? date : undefined;
  } catch {
    return undefined;
  }
}

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
    onChange('');
    setCalendarOpen(false);
  };

  const handleInputChange = (inputValue: string) => {
    if (formato === 'MES/ANO') {
      onChange(inputValue.toUpperCase());
      return;
    }

    let formattedValue = inputValue.replace(/\D/g, '');
    if (formato === 'DD/MM/AAAA') {
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
      if (formattedValue.length >= 5) {
        formattedValue = formattedValue.substring(0, 5) + '/' + formattedValue.substring(5, 9);
      }
    } else if (formattedValue.length >= 2) {
      formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 6);
    }
    onChange(formattedValue);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || Number.isNaN(date.getTime())) return;

    let formattedDate = '';
    if (formato === 'DD/MM/AAAA') {
      formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });
    } else if (formato === 'MM/AAAA') {
      formattedDate = format(date, "MM/yyyy", { locale: ptBR });
    } else {
      formattedDate = `${meses[date.getMonth()]}/${date.getFullYear()}`;
    }

    onChange(formattedDate);
    setCalendarOpen(false);
  };

  const handleClearDate = () => {
    onChange('');
    setCalendarOpen(false);
  };

  const getPlaceholder = () => {
    if (formato === 'DD/MM/AAAA') return '30/10/2025';
    if (formato === 'MM/AAAA') return '10/2025';
    return 'NOVEMBRO/2025';
  };

  const getMaxLength = () => {
    if (formato === 'DD/MM/AAAA') return 10;
    if (formato === 'MM/AAAA') return 7;
    return 20;
  };

  const getDisplayValue = () => {
    if (!value) return '';

    // Preserve legacy ISO values while showing them in the selected format.
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
      if (!Number.isNaN(date.getTime())) {
        if (formato === 'DD/MM/AAAA') return format(date, 'dd/MM/yyyy');
        if (formato === 'MM/AAAA') return format(date, 'MM/yyyy');
        return `${meses[date.getMonth()]}/${date.getFullYear()}`;
      }
    }

    return value;
  };

  const selectedDate = parseValueToDate(getDisplayValue(), formato);

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
            <Button type="button" variant="outline" className={cn('px-3', error && 'border-destructive')}>
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Selecionar Data</span>
                <Button type="button" variant="ghost" size="sm" onClick={handleClearDate} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
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
        <p className="text-xs text-muted-foreground">Exemplo: NOVEMBRO/2025, DEZEMBRO/2024, etc.</p>
      )}
      <p className="text-xs text-muted-foreground">Digite manualmente ou use o calendário para selecionar a data</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
