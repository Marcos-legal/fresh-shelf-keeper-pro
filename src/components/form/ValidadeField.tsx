import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ValidadeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const normalizeMonth = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const months = [
  "JANEIRO", "FEVEREIRO", "MARCO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
];

export function ValidadeField({ label, value, onChange, error, required = false }: ValidadeFieldProps) {
  const handleChange = (input: string) => {
    // Keep letters so pasted values such as "Dezembro/2026" are not destroyed.
    const cleaned = input
      .replace(/[^a-zA-ZÀ-ÿ0-9/\s]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 20);

    // Date format: DD/MM/AAAA. Format only when the user is entering a numeric date.
    if (/^\d/.test(cleaned)) {
      const digits = cleaned.replace(/\D/g, "").slice(0, 8);
      let formatted = digits;
      if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
      onChange(formatted);
      return;
    }

    // Month/year format: accept full Portuguese month names, e.g. Dezembro/2026.
    const parts = cleaned.split("/");
    if (parts.length === 2) {
      const month = normalizeMonth(parts[0].trim());
      const year = parts[1].replace(/\D/g, "").slice(0, 4);
      onChange(`${parts[0].trim()}${parts[0].trim() ? "/" : ""}${year}`.slice(0, 20));
      return;
    }

    onChange(cleaned);
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <Input
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="31/12/2026 ou Dezembro/2026"
        maxLength={20}
        aria-label={label}
        className={error ? 'border-destructive' : ''}
        autoComplete="off"
      />
      <p className="text-xs text-muted-foreground">
        Cole ou digite: DD/MM/AAAA ou Mês/Ano (ex.: 31/12/2026 ou Dezembro/2026)
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
