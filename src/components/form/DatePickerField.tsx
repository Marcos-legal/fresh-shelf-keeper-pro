import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { format, isValid, parse } from "date-fns";
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

function parseDateValue(value: string): Date | undefined {
  if (!value || !value.trim()) return undefined;
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const date = new Date(year, month - 1, day);
    return isValid(date) && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
  }
  const brMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]);
    let year = Number(brMatch[3]);
    if (year < 100) year += 2000;
    const date = new Date(year, month - 1, day);
    return isValid(date) && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
  }
  return undefined;
}

function normalizeToIso(value: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = parse(value, 'dd/MM/yyyy', new Date());
  return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : '';
}

export function DatePickerField({ label, value, onChange, error, required = false, id }: DatePickerFieldProps) {
  const date = parseDateValue(value);
  const displayValue = date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : value || '';

  const handleTextChange = (inputValue: string) => {
    const digits = inputValue.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) onChange(digits);
    else if (digits.length <= 4) onChange(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    else onChange(`${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input id={id} value={displayValue} onChange={(e) => handleTextChange(e.target.value)} placeholder="30/10/2025" maxLength={10} className={cn(error && "border-red-500", value && "pr-8")} />
          {value && (
            <button type="button" onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 opacity-60 hover:opacity-100" aria-label="Limpar data">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <label className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background hover:bg-accent" title="Selecionar data">
          <CalendarIcon className="h-4 w-4" />
          <input type="date" value={normalizeToIso(value)} onChange={(e) => onChange(e.target.value || '')} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`Selecionar ${label}`} />
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
