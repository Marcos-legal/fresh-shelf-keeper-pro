import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  id: string;
}

export function DatePickerField({ label, value, onChange, error, required = false, id }: DatePickerFieldProps) {
  const displayValue = value || '';

  const handleTextChange = (inputValue: string) => {
    const digits = inputValue.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    onChange(formatted);
  };

  const handleDateChange = (inputValue: string) => {
    if (!inputValue) {
      onChange('');
      return;
    }
    const [year, month, day] = inputValue.split('-');
    onChange(`${day}/${month}/${year}`);
  };

  const isoValue = /^\d{4}-\d{2}-\d{2}$/.test(value || '')
    ? value
    : '';

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={displayValue}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="30/10/2025"
          maxLength={10}
          aria-label={label}
          className={error ? 'border-destructive' : ''}
        />
        <label className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background hover:bg-accent" title="Selecionar data">
          <CalendarIcon className="h-4 w-4" />
          <input
            type="date"
            value={isoValue}
            onChange={(e) => handleDateChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`Selecionar ${label}`}
          />
        </label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
