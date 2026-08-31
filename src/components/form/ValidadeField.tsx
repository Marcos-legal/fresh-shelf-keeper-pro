import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
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

type FormatoValidade = 'DD/MM/AAAA' | 'MM/AAAA' | 'MES/ANO';

function normalizeForFormat(value: string, formato: FormatoValidade): string {
  if (!value) return '';
  if (formato === 'MES/ANO') return value.toUpperCase().slice(0, 20);

  const digits = value.replace(/\D/g, '');
  if (formato === 'DD/MM/AAAA') {
    const limited = digits.slice(0, 8);
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
  }

  const limited = digits.slice(0, 6);
  if (limited.length <= 2) return limited;
  return `${limited.slice(0, 2)}/${limited.slice(2)}`;
}

function isoToDisplay(value: string, formato: FormatoValidade): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;

  const [, year, month, day] = match;
  if (formato === 'DD/MM/AAAA') return `${day}/${month}/${year}`;
  if (formato === 'MM/AAAA') return `${month}/${year}`;
  return `${meses[Number(month) - 1]}/${year}`;
}

export function ValidadeField({ label, value, onChange, error, required = false }: ValidadeFieldProps) {
  const [formato, setFormato] = useState<FormatoValidade>('DD/MM/AAAA');
  const displayValue = isoToDisplay(value || '', formato);

  const handleFormatoChange = (novoFormato: FormatoValidade) => {
    setFormato(novoFormato);
    onChange('');
  };

  const handleInputChange = (inputValue: string) => {
    onChange(normalizeForFormat(inputValue, formato));
  };

  const handleNativeDateChange = (inputValue: string) => {
    if (!inputValue) {
      onChange('');
      return;
    }

    const [year, month, day] = inputValue.split('-');
    if (formato === 'DD/MM/AAAA') onChange(`${day}/${month}/${year}`);
    else if (formato === 'MM/AAAA') onChange(`${month}/${year}`);
    else onChange(`${meses[Number(month) - 1]}/${year}`);
  };

  const placeholder = formato === 'DD/MM/AAAA' ? '30/10/2025' : formato === 'MM/AAAA' ? '10/2025' : 'NOVEMBRO/2025';
  const maxLength = formato === 'DD/MM/AAAA' ? 10 : formato === 'MM/AAAA' ? 7 : 20;

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <div className="flex gap-2">
        <select
          value={formato}
          onChange={(e) => handleFormatoChange(e.target.value as FormatoValidade)}
          className="h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Formato da validade"
        >
          <option value="DD/MM/AAAA">DD/MM/AAAA</option>
          <option value="MM/AAAA">MM/AAAA</option>
          <option value="MES/ANO">MÊS/ANO</option>
        </select>

        <Input
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={cn("flex-1", error && "border-destructive")}
          maxLength={maxLength}
        />

        <label
          className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background hover:bg-accent"
          title="Selecionar data"
        >
          <CalendarIcon className="h-4 w-4" />
          <input
            type="date"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => handleNativeDateChange(e.target.value)}
            aria-label="Selecionar data de validade"
          />
        </label>

        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange('')} aria-label="Limpar validade" className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {formato === 'MES/ANO' && (
        <p className="text-xs text-muted-foreground">Exemplo: NOVEMBRO/2025, DEZEMBRO/2024, etc.</p>
      )}
      <p className="text-xs text-muted-foreground">Digite manualmente ou use o calendário para selecionar a data</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
