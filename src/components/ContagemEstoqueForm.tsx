
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Check, ChevronsUpDown } from "lucide-react";
import { ContagemFormData, ProdutoEstoque } from "@/types/estoque";
import { SelectField } from "@/components/form/SelectField";
import { NumberInputField } from "@/components/form/NumberInputField";
import { TextInputField } from "@/components/form/TextInputField";
import { ResponsavelSelectField } from "@/components/form/ResponsavelSelectField";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface ContagemEstoqueFormProps {
  onSubmit: (data: ContagemFormData) => void;
  produtos: ProdutoEstoque[];
  onClose?: () => void;
}

export function ContagemEstoqueForm({ onSubmit, produtos, onClose }: ContagemEstoqueFormProps) {
  const [produtoOpen, setProdutoOpen] = useState(false);
  const [formData, setFormData] = useState<ContagemFormData>({
    produto_id: '',
    quantidade: 0,
    quantidade_extra: 0,
    unidade_quantidade_extra: 'porcoes',
    responsavel: '',
    observacoes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContagemFormData, string>>>({});

  const produtoSelecionado = produtos.find(p => p.id === formData.produto_id);
  
  const calcularQuantidadeTotal = () => {
    if (!produtoSelecionado) return 0;
    
    const quantidadeBase = formData.quantidade * produtoSelecionado.quantidade_por_unidade;
    
    if (formData.unidade_quantidade_extra === 'porcoes') {
      return quantidadeBase + formData.quantidade_extra;
    } else {
      // Se for unidades individuais, calcular quantas porções representam
      const porcoesPorUnidade = produtoSelecionado.quantidade_por_unidade;
      const porcoesExtras = formData.quantidade_extra / porcoesPorUnidade;
      return quantidadeBase + porcoesExtras;
    }
  };

  const quantidadeTotal = calcularQuantidadeTotal();

  const produtoOptions = produtos.map(produto => ({
    value: produto.id,
    label: `${produto.nome} (${produto.quantidade_por_unidade} ${produto.unidade_conteudo}/${produto.unidade_medida})`
  }));

  const unidadeExtraOptions = [
    { value: 'porcoes', label: 'Porções/Conteúdo' },
    { value: 'unidades', label: 'Unidades Individuais' }
  ];

  const handleInputChange = (field: keyof ContagemFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumberInputChange = (field: keyof ContagemFormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Partial<Record<keyof ContagemFormData, string>> = {};
    
    if (!formData.produto_id) {
      validationErrors.produto_id = 'Produto é obrigatório';
    }
    
    if (formData.quantidade < 0) {
      validationErrors.quantidade = 'Quantidade não pode ser negativa';
    }
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
      setFormData({
        produto_id: '',
        quantidade: 0,
        quantidade_extra: 0,
        unidade_quantidade_extra: 'porcoes',
        responsavel: '',
        observacoes: '',
      });
      if (onClose) onClose();
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="min-w-0 w-full animate-fade-in">
        <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Popover modal open={produtoOpen} onOpenChange={setProdutoOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={produtoOpen}
                    className={cn(
                      "h-12 w-full justify-between font-normal sm:h-10",
                      !formData.produto_id && "text-muted-foreground",
                      errors.produto_id && "border-destructive"
                    )}
                  >
                    <span className="truncate text-left">
                      {formData.produto_id
                        ? produtoOptions.find(o => o.value === formData.produto_id)?.label
                        : "Selecione ou digite o nome do produto"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="z-[70] w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] overflow-hidden p-0" align="start" side="bottom" sideOffset={6} collisionPadding={12} avoidCollisions>
                  <Command>
                    <CommandInput placeholder="Buscar produto..." />
                    <CommandList>
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {produtoOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.label}
                            onSelect={() => {
                              handleInputChange('produto_id', option.value);
                              setProdutoOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.produto_id === option.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.produto_id && <p className="text-sm text-destructive">{errors.produto_id}</p>}
            </div>

            <NumberInputField
              id="quantidade"
              label={`Quantidade Principal${produtoSelecionado ? ` (${produtoSelecionado.unidade_medida})` : ''}`}
              value={formData.quantidade}
              onChange={(value) => handleNumberInputChange('quantidade', value)}
              error={errors.quantidade}
              min={0}
              required
            />

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberInputField
                id="quantidade_extra"
                label="Quantidade Extra"
                value={formData.quantidade_extra}
                onChange={(value) => handleNumberInputChange('quantidade_extra', value)}
                min={0}
                required={false}
              />

              <SelectField
                label="Unidade da Quantidade Extra"
                value={formData.unidade_quantidade_extra}
                onChange={(value: 'porcoes' | 'unidades') => handleInputChange('unidade_quantidade_extra', value)}
                options={unidadeExtraOptions}
                required={false}
              />
            </div>

            {produtoSelecionado && (
              <div className="min-w-0 overflow-hidden rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
                <h3 className="font-medium text-blue-900 mb-3">📊 Cálculo do Estoque</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:justify-between">
                    <span>Quantidade Principal:</span>
                    <span className="font-medium">
                      {formData.quantidade} {produtoSelecionado.unidade_medida} × {produtoSelecionado.quantidade_por_unidade} = {formData.quantidade * produtoSelecionado.quantidade_por_unidade} {produtoSelecionado.unidade_conteudo}
                    </span>
                  </div>
                  
                  {formData.quantidade_extra > 0 && (
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:justify-between">
                      <span>Quantidade Extra:</span>
                      <span className="font-medium">
                        {formData.quantidade_extra} {formData.unidade_quantidade_extra === 'porcoes' ? produtoSelecionado.unidade_conteudo : 'unidades individuais'}
                        {formData.unidade_quantidade_extra === 'unidades' && 
                          ` (${(formData.quantidade_extra / produtoSelecionado.quantidade_por_unidade).toFixed(2)} ${produtoSelecionado.unidade_conteudo})`
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="flex min-w-0 flex-col gap-1 border-t pt-2 font-bold text-blue-900 sm:flex-row sm:justify-between">
                    <span>Total no Estoque:</span>
                    <span className="text-lg">
                      {Number.isInteger(quantidadeTotal) ? quantidadeTotal : quantidadeTotal.toFixed(2)} {produtoSelecionado.unidade_conteudo}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <ResponsavelSelectField
              label="Responsável pela Contagem"
              value={formData.responsavel || ''}
              onChange={(value) => handleInputChange('responsavel', value)}
              required={false}
            />

            <TextInputField
              id="observacoes"
              label="Observações"
              value={formData.observacoes || ''}
              onChange={(value) => handleInputChange('observacoes', value)}
              placeholder="Observações adicionais sobre a contagem"
              required={false}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-6 border-t sm:flex-row sm:justify-end sm:gap-4">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="h-12 w-full sm:h-10 sm:w-auto">
                Cancelar
              </Button>
            )}
            <Button type="submit" className="gradient-blue text-white h-12 w-full sm:h-10 sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Registrar Contagem
            </Button>
          </div>
        </form>
    </div>
  );
}
