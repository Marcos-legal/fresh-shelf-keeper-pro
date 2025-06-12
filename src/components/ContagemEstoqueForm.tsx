
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Save } from "lucide-react";
import { ContagemFormData, ProdutoEstoque } from "@/types/estoque";
import { SelectField } from "@/components/form/SelectField";
import { NumberInputField } from "@/components/form/NumberInputField";
import { TextInputField } from "@/components/form/TextInputField";
import { ResponsavelSelectField } from "@/components/form/ResponsavelSelectField";

interface ContagemEstoqueFormProps {
  onSubmit: (data: ContagemFormData) => void;
  produtos: ProdutoEstoque[];
  onClose?: () => void;
}

export function ContagemEstoqueForm({ onSubmit, produtos, onClose }: ContagemEstoqueFormProps) {
  const [formData, setFormData] = useState<ContagemFormData>({
    produtoId: '',
    quantidade: 0,
    quantidadeExtra: 0,
    unidadeQuantidadeExtra: 'porcoes',
    responsavel: '',
    observacoes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContagemFormData, string>>>({});

  const produtoSelecionado = produtos.find(p => p.id === formData.produtoId);
  
  const calcularQuantidadeTotal = () => {
    if (!produtoSelecionado) return 0;
    
    const quantidadeBase = formData.quantidade * produtoSelecionado.quantidadePorUnidade;
    
    if (formData.unidadeQuantidadeExtra === 'porcoes') {
      return quantidadeBase + formData.quantidadeExtra;
    } else {
      // Se for unidades individuais, calcular quantas porções representam
      const porcoesPorUnidade = produtoSelecionado.quantidadePorUnidade;
      const porcoesExtras = formData.quantidadeExtra / porcoesPorUnidade;
      return quantidadeBase + porcoesExtras;
    }
  };

  const quantidadeTotal = calcularQuantidadeTotal();

  const produtoOptions = produtos.map(produto => ({
    value: produto.id,
    label: `${produto.nome} (${produto.quantidadePorUnidade} ${produto.unidadeConteudo}/${produto.unidadeMedida})`
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
    
    if (!formData.produtoId) {
      validationErrors.produtoId = 'Produto é obrigatório';
    }
    
    if (formData.quantidade < 0) {
      validationErrors.quantidade = 'Quantidade não pode ser negativa';
    }
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
      setFormData({
        produtoId: '',
        quantidade: 0,
        quantidadeExtra: 0,
        unidadeQuantidadeExtra: 'porcoes',
        responsavel: '',
        observacoes: '',
      });
      if (onClose) onClose();
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="w-6 h-6" />
          <span>Nova Contagem de Estoque</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <SelectField
              label="Produto"
              value={formData.produtoId}
              onChange={(value: string) => handleInputChange('produtoId', value)}
              options={produtoOptions}
              placeholder="Selecione um produto"
              error={errors.produtoId}
              required
            />

            <NumberInputField
              id="quantidade"
              label={`Quantidade Principal${produtoSelecionado ? ` (${produtoSelecionado.unidadeMedida})` : ''}`}
              value={formData.quantidade}
              onChange={(value) => handleNumberInputChange('quantidade', value)}
              error={errors.quantidade}
              min={0}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <NumberInputField
                id="quantidadeExtra"
                label="Quantidade Extra"
                value={formData.quantidadeExtra}
                onChange={(value) => handleNumberInputChange('quantidadeExtra', value)}
                min={0}
                required={false}
              />

              <SelectField
                label="Unidade da Quantidade Extra"
                value={formData.unidadeQuantidadeExtra}
                onChange={(value: 'porcoes' | 'unidades') => handleInputChange('unidadeQuantidadeExtra', value)}
                options={unidadeExtraOptions}
                required={false}
              />
            </div>

            {produtoSelecionado && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-3">📊 Cálculo do Estoque</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <div className="flex justify-between">
                    <span>Quantidade Principal:</span>
                    <span className="font-medium">
                      {formData.quantidade} {produtoSelecionado.unidadeMedida} × {produtoSelecionado.quantidadePorUnidade} = {formData.quantidade * produtoSelecionado.quantidadePorUnidade} {produtoSelecionado.unidadeConteudo}
                    </span>
                  </div>
                  
                  {formData.quantidadeExtra > 0 && (
                    <div className="flex justify-between">
                      <span>Quantidade Extra:</span>
                      <span className="font-medium">
                        {formData.quantidadeExtra} {formData.unidadeQuantidadeExtra === 'porcoes' ? produtoSelecionado.unidadeConteudo : 'unidades individuais'}
                        {formData.unidadeQuantidadeExtra === 'unidades' && 
                          ` (${(formData.quantidadeExtra / produtoSelecionado.quantidadePorUnidade).toFixed(2)} ${produtoSelecionado.unidadeConteudo})`
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 flex justify-between font-bold text-blue-900">
                    <span>Total no Estoque:</span>
                    <span className="text-lg">
                      {quantidadeTotal.toFixed(2)} {produtoSelecionado.unidadeConteudo}
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

          <div className="flex justify-end space-x-4 pt-6 border-t">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            )}
            <Button type="submit" className="gradient-blue text-white">
              <Save className="w-4 h-4 mr-2" />
              Registrar Contagem
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
