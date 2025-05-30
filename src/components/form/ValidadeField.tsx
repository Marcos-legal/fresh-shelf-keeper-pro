
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

const meses = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

export function ValidadeField({
  label,
  value,
  onChange,
  error,
  required = false,
}: ValidadeFieldProps) {
  const [formato, setFormato] = useState<'DD/MM/AA' | 'MM/AA' | 'MES/ANO'>('DD/MM/AA');

  const handleFormatoChange = (novoFormato: 'DD/MM/AA' | 'MM/AA' | 'MES/ANO') => {
    setFormato(novoFormato);
    onChange(''); // Limpa o valor quando muda o formato
  };

  const handleInputChange = (inputValue: string) => {
    if (formato === 'MES/ANO') {
      // Para formato MES/ANO, permitir texto livre mas converter para maiúsculo
      const upperValue = inputValue.toUpperCase();
      onChange(upperValue);
      return;
    }

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

  const getPlaceholder = () => {
    switch (formato) {
      case 'DD/MM/AA':
        return "30/10/25";
      case 'MM/AA':
        return "10/25";
      case 'MES/ANO':
        return "NOVEMBRO/2025";
      default:
        return "";
    }
  };

  const getMaxLength = () => {
    switch (formato) {
      case 'DD/MM/AA':
        return 8;
      case 'MM/AA':
        return 5;
      case 'MES/ANO':
        return 20;
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <div className="flex space-x-2">
        <Select value={formato} onValueChange={handleFormatoChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DD/MM/AA">DD/MM/AA</SelectItem>
            <SelectItem value="MM/AA">MM/AA</SelectItem>
            <SelectItem value="MES/ANO">MÊS/ANO</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={getPlaceholder()}
          className={error ? 'border-red-500 flex-1' : 'flex-1'}
          maxLength={getMaxLength()}
        />
      </div>
      {formato === 'MES/ANO' && (
        <p className="text-xs text-gray-500">
          Exemplo: NOVEMBRO/2025, DEZEMBRO/2024, etc.
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
