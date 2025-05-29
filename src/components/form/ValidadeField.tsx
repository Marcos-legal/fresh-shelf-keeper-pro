
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ValidadeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function ValidadeField({
  label,
  value,
  onChange,
  error,
  required = false,
}: ValidadeFieldProps) {
  const [formato, setFormato] = useState<'DD/MM/AA' | 'MM/AA'>('DD/MM/AA');

  const handleFormatoChange = (novoFormato: 'DD/MM/AA' | 'MM/AA') => {
    setFormato(novoFormato);
    onChange(''); // Limpa o valor quando muda o formato
  };

  const handleInputChange = (inputValue: string) => {
    let formattedValue = inputValue.replace(/\D/g, ''); // Remove não dígitos
    
    if (formato === 'DD/MM/AA') {
      // Formato DD/MM/AA
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
      if (formattedValue.length >= 5) {
        formattedValue = formattedValue.substring(0, 5) + '/' + formattedValue.substring(5, 7);
      }
    } else {
      // Formato MM/AA
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
    }
    
    onChange(formattedValue);
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <div className="flex space-x-2">
        <Select value={formato} onValueChange={handleFormatoChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DD/MM/AA">DD/MM/AA</SelectItem>
            <SelectItem value="MM/AA">MM/AA</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={formato === 'DD/MM/AA' ? "10/10/25" : "10/25"}
          className={error ? 'border-red-500 flex-1' : 'flex-1'}
          maxLength={formato === 'DD/MM/AA' ? 8 : 5}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
