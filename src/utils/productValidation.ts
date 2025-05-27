
import { ProductFormData } from "@/types/product";

export const validateProductForm = (formData: ProductFormData): Partial<Record<keyof ProductFormData, string>> => {
  const errors: Partial<Record<keyof ProductFormData, string>> = {};

  // Apenas campos obrigatórios: dataAbertura, diasParaVencer, localArmazenamento e responsavel
  if (!formData.dataAbertura) errors.dataAbertura = 'Data de abertura é obrigatória';
  if (!formData.responsavel.trim()) errors.responsavel = 'Responsável é obrigatório';
  if (formData.diasParaVencer <= 0) errors.diasParaVencer = 'Dias para vencer deve ser maior que 0';
  if (!formData.localArmazenamento) errors.localArmazenamento = 'Local de armazenamento é obrigatório';

  // Validar se a data de abertura é posterior à fabricação (se fabricação estiver preenchida)
  if (formData.dataFabricacao && formData.dataAbertura) {
    const fabricacao = new Date(formData.dataFabricacao);
    const abertura = new Date(formData.dataAbertura);
    if (abertura < fabricacao) {
      errors.dataAbertura = 'Data de abertura não pode ser anterior à fabricação';
    }
  }

  return errors;
};
