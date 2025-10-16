
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Save, Calendar, EyeOff, Eye } from "lucide-react";
import { ProductFormData, StorageLocation } from "@/types/product";
import { validateProductForm } from "@/utils/productValidation";
import { TextInputField } from "@/components/form/TextInputField";
import { DatePickerField } from "@/components/form/DatePickerField";
import { NumberInputField } from "@/components/form/NumberInputField";
import { SelectField } from "@/components/form/SelectField";

import { ValidadeField } from "@/components/form/ValidadeField";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
  title?: string;
  submitLabel?: string;
}

const storageOptions: { value: StorageLocation; label: string }[] = [
  { value: 'refrigerado', label: 'Refrigerado' },
  { value: 'congelado', label: 'Congelado' },
  { value: 'ambiente', label: 'Ambiente' },
  { value: 'camara-fria', label: 'Câmara Fria' },
];

export function ProductForm({ 
  onSubmit, 
  initialData, 
  title = "Cadastro de Produto",
  submitLabel = "Salvar Produto"
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    nome: initialData?.nome || '',
    lote: initialData?.lote || '',
    marca: initialData?.marca || '',
    dataFabricacao: initialData?.dataFabricacao || '',
    validade: initialData?.validade || '',
    dataAbertura: initialData?.dataAbertura || '',
    diasParaVencer: initialData?.diasParaVencer || undefined,
    localArmazenamento: initialData?.localArmazenamento || undefined,
    showOptionalDates: initialData?.showOptionalDates ?? false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumberInputChange = (field: keyof ProductFormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleToggleOptionalDates = (show: boolean) => {
    setFormData(prev => ({ ...prev, showOptionalDates: show }));
  };

  const handleUpdateDates = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      dataFabricacao: today,
      dataAbertura: today
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProductForm(formData);
    
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
          <div className="flex justify-between items-center mb-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleUpdateDates}
              className="text-blue-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Atualizar Datas (Hoje)
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => handleToggleOptionalDates(!formData.showOptionalDates)}
              className="text-gray-600"
            >
              {formData.showOptionalDates ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar Datas Opcionais
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Mostrar Datas Opcionais
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInputField
              id="nome"
              label="Nome do Produto (Opcional)"
              value={formData.nome || ''}
              onChange={(value) => handleInputChange('nome', value)}
              placeholder="Digite o nome do produto"
              error={errors.nome}
            />

            <TextInputField
              id="lote"
              label="Lote (Opcional)"
              value={formData.lote || ''}
              onChange={(value) => handleInputChange('lote', value)}
              placeholder="Digite o lote"
              error={errors.lote}
            />

            <TextInputField
              id="marca"
              label="Marca (Opcional)"
              value={formData.marca || ''}
              onChange={(value) => handleInputChange('marca', value)}
              placeholder="Digite a marca"
              error={errors.marca}
            />

            {formData.showOptionalDates && (
              <>
                <DatePickerField
                  id="dataFabricacao"
                  label="Data de Fabricação (Opcional)"
                  value={formData.dataFabricacao || ''}
                  onChange={(value) => handleInputChange('dataFabricacao', value)}
                  error={errors.dataFabricacao}
                  required={false}
                />

                <ValidadeField
                  label="Data de Validade (Opcional)"
                  value={formData.validade || ''}
                  onChange={(value) => handleInputChange('validade', value)}
                  error={errors.validade}
                  required={false}
                />
              </>
            )}

            <DatePickerField
              id="dataAbertura"
              label="Data de Abertura (Opcional)"
              value={formData.dataAbertura || ''}
              onChange={(value) => handleInputChange('dataAbertura', value)}
              error={errors.dataAbertura}
              required={false}
            />

            <NumberInputField
              id="diasParaVencer"
              label="Dias para Vencer após Abertura (Opcional)"
              value={formData.diasParaVencer || 0}
              onChange={(value) => handleNumberInputChange('diasParaVencer', value)}
              error={errors.diasParaVencer}
              min={0}
              required={false}
            />

            <SelectField
              label="Local de Armazenamento (Opcional)"
              value={formData.localArmazenamento || ''}
              onChange={(value: StorageLocation) => handleInputChange('localArmazenamento', value)}
              options={storageOptions}
              placeholder="Selecione o local"
              required={false}
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
