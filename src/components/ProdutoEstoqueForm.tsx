
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Save } from "lucide-react";
import { EstoqueFormData } from "@/hooks/useEstoqueSupabase";
import { TextInputField } from "@/components/form/TextInputField";
import { NumberInputField } from "@/components/form/NumberInputField";

interface ProdutoEstoqueFormProps {
  onSubmit: (data: EstoqueFormData) => void;
  initialData?: Partial<EstoqueFormData>;
  title?: string;
  submitLabel?: string;
}

export function ProdutoEstoqueForm({ 
  onSubmit, 
  initialData, 
  title = "Cadastro de Produto para Estoque",
  submitLabel = "Salvar Produto"
}: ProdutoEstoqueFormProps) {
  const [formData, setFormData] = useState<EstoqueFormData>({
    nome: initialData?.nome || '',
    unidade_medida: initialData?.unidade_medida || '',
    quantidade_por_unidade: initialData?.quantidade_por_unidade || 1,
    unidade_conteudo: initialData?.unidade_conteudo || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EstoqueFormData, string>>>({});

  const handleInputChange = (field: keyof EstoqueFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumberInputChange = (field: keyof EstoqueFormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Partial<Record<keyof EstoqueFormData, string>> = {};
    
    if (!formData.nome.trim()) {
      validationErrors.nome = 'Nome do produto é obrigatório';
    }
    
    if (!formData.unidade_medida.trim()) {
      validationErrors.unidade_medida = 'Unidade de medida é obrigatória';
    }
    
    if (!formData.unidade_conteudo.trim()) {
      validationErrors.unidade_conteudo = 'Unidade de conteúdo é obrigatória';
    }
    
    if (formData.quantidade_por_unidade <= 0) {
      validationErrors.quantidade_por_unidade = 'Quantidade deve ser maior que zero';
    }
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-6 h-6" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInputField
              id="nome"
              label="Nome do Produto"
              value={formData.nome}
              onChange={(value) => handleInputChange('nome', value)}
              placeholder="Ex: Mussarela Parmeggiano"
              error={errors.nome}
              required
            />

            <TextInputField
              id="unidade_medida"
              label="Unidade de Medida"
              value={formData.unidade_medida}
              onChange={(value) => handleInputChange('unidade_medida', value)}
              placeholder="Ex: pacote, caixa, bandeja"
              error={errors.unidade_medida}
              required
            />

            <NumberInputField
              id="quantidade_por_unidade"
              label="Quantidade por Unidade"
              value={formData.quantidade_por_unidade}
              onChange={(value) => handleNumberInputChange('quantidade_por_unidade', value)}
              error={errors.quantidade_por_unidade}
              min={1}
              required
            />

            <TextInputField
              id="unidade_conteudo"
              label="Unidade de Conteúdo"
              value={formData.unidade_conteudo}
              onChange={(value) => handleInputChange('unidade_conteudo', value)}
              placeholder="Ex: porções, unidades, fatias"
              error={errors.unidade_conteudo}
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="submit" className="gradient-blue text-white">
              <Save className="w-4 h-4 mr-2" />
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
