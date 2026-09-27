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

export function ProductForm({ onSubmit, initialData, title = "Cadastro de Produto", submitLabel = "Salvar Produto" }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    nome: initialData?.nome || '', lote: initialData?.lote || '', marca: initialData?.marca || '',
    dataFabricacao: initialData?.dataFabricacao || '', validade: initialData?.validade || '',
    dataAbertura: initialData?.dataAbertura || '', diasParaVencer: initialData?.diasParaVencer || undefined,
    localArmazenamento: initialData?.localArmazenamento || undefined, precoCusto: initialData?.precoCusto,
    showOptionalDates: initialData?.showOptionalDates ?? false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const handleNumberInputChange = (field: keyof ProductFormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const handleToggleOptionalDates = (show: boolean) => setFormData(prev => ({ ...prev, showOptionalDates: show }));
  const handleUpdateDates = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, dataFabricacao: today, dataAbertura: today }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProductForm(formData);
    if (Object.keys(validationErrors).length === 0) onSubmit(formData);
    else setErrors(validationErrors);
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm animate-fade-in">
      <CardHeader className="border-b border-border/50 bg-muted/20 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Preencha os dados do produto e controle sua validade.</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Informações do produto</h3>
              <p className="mt-1 text-xs text-muted-foreground">Identificação básica para facilitar o controle.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInputField id="nome" label="Nome do Produto (Opcional)" value={formData.nome || ''} onChange={(value) => handleInputChange('nome', value)} placeholder="Digite o nome do produto" error={errors.nome} />
              <TextInputField id="lote" label="Lote (Opcional)" value={formData.lote || ''} onChange={(value) => handleInputChange('lote', value)} placeholder="Digite o lote" error={errors.lote} />
              <TextInputField id="marca" label="Marca (Opcional)" value={formData.marca || ''} onChange={(value) => handleInputChange('marca', value)} placeholder="Digite a marca" error={errors.marca} />
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-background p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">Datas e validade</h3>
                <p className="mt-1 text-xs text-muted-foreground">Controle quando o produto foi aberto e até quando deve ser utilizado.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={handleUpdateDates} className="h-9 w-full text-sm sm:w-auto">
                  <Calendar className="mr-2 h-4 w-4" /> Atualizar para hoje
                </Button>
                <Button type="button" variant={formData.showOptionalDates ? "secondary" : "outline"} onClick={() => handleToggleOptionalDates(!formData.showOptionalDates)} className="h-9 w-full text-sm sm:w-auto">
                  {formData.showOptionalDates ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {formData.showOptionalDates ? 'Ocultar opcionais' : 'Mostrar opcionais'}
                </Button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <DatePickerField id="dataAbertura" label="Data de Abertura (Opcional)" value={formData.dataAbertura || ''} onChange={(value) => handleInputChange('dataAbertura', value)} error={errors.dataAbertura} required={false} />
              <NumberInputField id="diasParaVencer" label="Dias para Vencer após Abertura (Opcional)" value={formData.diasParaVencer || 0} onChange={(value) => handleNumberInputChange('diasParaVencer', value)} error={errors.diasParaVencer} min={0} required={false} />
            </div>

            {formData.showOptionalDates && (
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 md:grid-cols-2">
                <div className="md:col-span-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" /> Informações adicionais
                </div>
                <DatePickerField id="dataFabricacao" label="Data de Fabricação (Opcional)" value={formData.dataFabricacao || ''} onChange={(value) => handleInputChange('dataFabricacao', value)} error={errors.dataFabricacao} required={false} />
                <ValidadeField label="Data de Validade (Opcional)" value={formData.validade || ''} onChange={(value) => handleInputChange('validade', value)} error={errors.validade} required={false} />
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Armazenamento e custo</h3>
              <p className="mt-1 text-xs text-muted-foreground">Defina onde o produto fica armazenado e, se desejar, seu custo.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField label="Local de Armazenamento (Opcional)" value={formData.localArmazenamento || ''} onChange={(value: StorageLocation) => handleInputChange('localArmazenamento', value)} options={storageOptions} placeholder="Selecione o local" required={false} />
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="precoCusto">Preço de Custo (R$) — opcional</label>
                <input id="precoCusto" type="number" inputMode="decimal" step="0.01" min={0} value={formData.precoCusto ?? ''} onChange={(e) => { const v = e.target.value; setFormData((p) => ({ ...p, precoCusto: v === '' ? undefined : Number(v) })); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Ex.: 12,90" />
                <p className="text-xs text-muted-foreground">Usado para calcular prejuízos em descartes/vencimentos.</p>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row sm:justify-end">
            <Button type="submit" className="gradient-blue h-10 w-full text-white shadow-sm sm:w-auto sm:min-w-40">
              <Save className="mr-2 h-4 w-4" /> {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
