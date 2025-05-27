
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
  const [formato, setFormato] = useState<'DD/MM/AAAA' | 'MM/AAAA'>('DD/MM/AAAA');

  const handleFormatoChange = (novoFormato: 'DD/MM/AAAA' | 'MM/AAAA') => {
    setFormato(novoFormato);
    onChange(''); // Limpa o valor quando muda o formato
  };

  const handleInputChange = (inputValue: string) => {
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

  const convertToISODate = (dateStr: string) => {
    if (formato === 'DD/MM/AAAA') {
      const [day, month, year] = dateStr.split('/');
      if (day && month && year && year.length === 4) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    } else {
      const [month, year] = dateStr.split('/');
      if (month && year && year.length === 4) {
        // Usa o último dia do mês
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        return `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      }
    }
    return '';
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
            <SelectItem value="DD/MM/AAAA">DD/MM/AAAA</SelectItem>
            <SelectItem value="MM/AAAA">MM/AAAA</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={formato}
          className={error ? 'border-red-500 flex-1' : 'flex-1'}
          maxLength={formato === 'DD/MM/AAAA' ? 10 : 7}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
