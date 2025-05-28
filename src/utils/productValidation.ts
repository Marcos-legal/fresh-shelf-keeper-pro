
import { ProductFormData } from "@/types/product";

export const validateProductForm = (formData: ProductFormData): Partial<Record<keyof ProductFormData, string>> => {
  const errors: Partial<Record<keyof ProductFormData, string>> = {};

  // Campos obrigatórios
  if (!formData.dataAbertura) {
    errors.dataAbertura = 'Data de abertura é obrigatória';
  }

  if (!formData.responsavel) {
    errors.responsavel = 'Responsável é obrigatório';
  }

  if (!formData.localArmazenamento) {
    errors.localArmazenamento = 'Local de armazenamento é obrigatório';
  }

  if (!formData.diasParaVencer || formData.diasParaVencer <= 0) {
    errors.diasParaVencer = 'Dias para vencer deve ser maior que 0';
  }

  return errors;
};
