
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Package, Save } from "lucide-react";
import { ProductFormData, StorageLocation } from "@/types/product";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [calendarOpen, setCalendarOpen] = useState<string | null>(null);

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateSelect = (field: 'dataFabricacao' | 'validade' | 'dataAbertura', date: Date | undefined) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      handleInputChange(field, dateString);
      setCalendarOpen(null);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Selecionar data';
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.lote.trim()) newErrors.lote = 'Lote é obrigatório';
    if (!formData.marca.trim()) newErrors.marca = 'Marca é obrigatória';
    if (!formData.dataFabricacao) newErrors.dataFabricacao = 'Data de fabricação é obrigatória';
    if (!formData.validade) newErrors.validade = 'Data de validade é obrigatória';
    if (!formData.responsavel.trim()) newErrors.responsavel = 'Responsável é obrigatório';
    if (formData.diasParaVencer <= 0) newErrors.diasParaVencer = 'Dias para vencer deve ser maior que 0';

    // Validar se a data de validade é posterior à fabricação
    if (formData.dataFabricacao && formData.validade) {
      const fabricacao = new Date(formData.dataFabricacao);
      const validade = new Date(formData.validade);
      if (validade <= fabricacao) {
        newErrors.validade = 'Data de validade deve ser posterior à fabricação';
      }
    }

    // Validar se a data de abertura é posterior à fabricação
    if (formData.dataFabricacao && formData.dataAbertura) {
      const fabricacao = new Date(formData.dataFabricacao);
      const abertura = new Date(formData.dataAbertura);
      if (abertura < fabricacao) {
        newErrors.dataAbertura = 'Data de abertura não pode ser anterior à fabricação';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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
            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Digite o nome do produto"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
            </div>

            {/* Lote */}
            <div className="space-y-2">
              <Label htmlFor="lote">Lote *</Label>
              <Input
                id="lote"
                value={formData.lote}
                onChange={(e) => handleInputChange('lote', e.target.value)}
                placeholder="Digite o lote"
                className={errors.lote ? 'border-red-500' : ''}
              />
              {errors.lote && <p className="text-sm text-red-500">{errors.lote}</p>}
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                placeholder="Digite a marca"
                className={errors.marca ? 'border-red-500' : ''}
              />
              {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                placeholder="Digite o nome do responsável"
                className={errors.responsavel ? 'border-red-500' : ''}
              />
              {errors.responsavel && <p className="text-sm text-red-500">{errors.responsavel}</p>}
            </div>

            {/* Data de Fabricação */}
            <div className="space-y-2">
              <Label>Data de Fabricação *</Label>
              <Popover open={calendarOpen === 'fabricacao'} onOpenChange={(open) => setCalendarOpen(open ? 'fabricacao' : null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dataFabricacao && "text-muted-foreground",
                      errors.dataFabricacao && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateForDisplay(formData.dataFabricacao)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dataFabricacao ? new Date(formData.dataFabricacao) : undefined}
                    onSelect={(date) => handleDateSelect('dataFabricacao', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.dataFabricacao && <p className="text-sm text-red-500">{errors.dataFabricacao}</p>}
            </div>

            {/* Data de Validade */}
            <div className="space-y-2">
              <Label>Data de Validade *</Label>
              <Popover open={calendarOpen === 'validade'} onOpenChange={(open) => setCalendarOpen(open ? 'validade' : null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.validade && "text-muted-foreground",
                      errors.validade && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateForDisplay(formData.validade)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.validade ? new Date(formData.validade) : undefined}
                    onSelect={(date) => handleDateSelect('validade', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.validade && <p className="text-sm text-red-500">{errors.validade}</p>}
            </div>

            {/* Data de Abertura */}
            <div className="space-y-2">
              <Label>Data de Abertura (Opcional)</Label>
              <Popover open={calendarOpen === 'abertura'} onOpenChange={(open) => setCalendarOpen(open ? 'abertura' : null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dataAbertura && "text-muted-foreground",
                      errors.dataAbertura && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateForDisplay(formData.dataAbertura)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dataAbertura ? new Date(formData.dataAbertura) : undefined}
                    onSelect={(date) => handleDateSelect('dataAbertura', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.dataAbertura && <p className="text-sm text-red-500">{errors.dataAbertura}</p>}
            </div>

            {/* Dias para Vencer */}
            <div className="space-y-2">
              <Label htmlFor="diasParaVencer">Dias para Vencer após Abertura *</Label>
              <Input
                id="diasParaVencer"
                type="number"
                min="1"
                value={formData.diasParaVencer}
                onChange={(e) => handleInputChange('diasParaVencer', parseInt(e.target.value) || 0)}
                className={errors.diasParaVencer ? 'border-red-500' : ''}
              />
              {errors.diasParaVencer && <p className="text-sm text-red-500">{errors.diasParaVencer}</p>}
            </div>

            {/* Local de Armazenamento */}
            <div className="space-y-2">
              <Label>Local de Armazenamento *</Label>
              <Select 
                value={formData.localArmazenamento} 
                onValueChange={(value: StorageLocation) => handleInputChange('localArmazenamento', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  {storageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
