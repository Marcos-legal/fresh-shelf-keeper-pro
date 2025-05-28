
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Save, Calendar } from "lucide-react";
import { ProductFormData, StorageLocation } from "@/types/product";
import { validateProductForm } from "@/utils/productValidation";
import { TextInputField } from "@/components/form/TextInputField";
import { DatePickerField } from "@/components/form/DatePickerField";
import { NumberInputField } from "@/components/form/NumberInputField";
import { SelectField } from "@/components/form/SelectField";
import { ResponsavelSelectField } from "@/components/form/ResponsavelSelectField";
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
    diasParaVencer: initialData?.diasParaVencer || 30,
    localArmazenamento: initialData?.localArmazenamento || 'ambiente',
    responsavel: initialData?.responsavel || '',
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
          <div className="flex justify-end mb-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleUpdateDates}
              className="text-blue-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Atualizar Datas (Hoje)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInputField
              id="nome"
              label="Nome do Produto"
              value={formData.nome}
              onChange={(value) => handleInputChange('nome', value)}
              placeholder="Digite o nome do produto"
              error={errors.nome}
            />

            <TextInputField
              id="lote"
              label="Lote"
              value={formData.lote}
              onChange={(value) => handleInputChange('lote', value)}
              placeholder="Digite o lote"
              error={errors.lote}
            />

            <TextInputField
              id="marca"
              label="Marca"
              value={formData.marca}
              onChange={(value) => handleInputChange('marca', value)}
              placeholder="Digite a marca"
              error={errors.marca}
            />

            <ResponsavelSelectField
              label="Responsável"
              value={formData.responsavel}
              onChange={(value) => handleInputChange('responsavel', value)}
              error={errors.responsavel}
              required={true}
            />

            <DatePickerField
              id="dataFabricacao"
              label="Data de Fabricação"
              value={formData.dataFabricacao}
              onChange={(value) => handleInputChange('dataFabricacao', value)}
              error={errors.dataFabricacao}
            />

            <ValidadeField
              label="Data de Validade"
              value={formData.validade}
              onChange={(value) => handleInputChange('validade', value)}
              error={errors.validade}
            />

            <DatePickerField
              id="dataAbertura"
              label="Data de Abertura"
              value={formData.dataAbertura || ''}
              onChange={(value) => handleInputChange('dataAbertura', value)}
              error={errors.dataAbertura}
              required={true}
            />

            <NumberInputField
              id="diasParaVencer"
              label="Dias para Vencer após Abertura"
              value={formData.diasParaVencer}
              onChange={(value) => handleNumberInputChange('diasParaVencer', value)}
              error={errors.diasParaVencer}
              min={1}
              required={true}
            />

            <SelectField
              label="Local de Armazenamento"
              value={formData.localArmazenamento}
              onChange={(value: StorageLocation) => handleInputChange('localArmazenamento', value)}
              options={storageOptions}
              placeholder="Selecione o local"
              required={true}
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
