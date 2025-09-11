
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NumberInputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
  min?: number;
  id: string;
}

export function NumberInputField({
  label,
  value,
  onChange,
  error,
  required = false,
  min,
  id
}: NumberInputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseInt(e.target.value) || 0;
    onChange(numericValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        value={value}
        onChange={handleChange}
        className={`touch-manipulation form-input ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
