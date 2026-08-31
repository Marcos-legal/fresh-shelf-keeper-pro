import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ValidadeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function ValidadeField({ label, value, onChange, error, required = false }: ValidadeFieldProps) {
  const handleChange = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <Input
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="30/10/2025"
        maxLength={10}
        aria-label={label}
        className={error ? 'border-destructive' : ''}
      />
      <p className="text-xs text-muted-foreground">Digite a validade no formato DD/MM/AAAA</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
