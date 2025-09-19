
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TextInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  id: string;
}

export function TextInputField({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  id
}: TextInputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
