
import { ProductFormData } from "@/types/product";

export const validateProductForm = (formData: ProductFormData): Partial<Record<keyof ProductFormData, string>> => {
  const errors: Partial<Record<keyof ProductFormData, string>> = {};

  // Todos os campos são opcionais agora
  // Apenas validações básicas se preenchidos
  if (formData.diasParaVencer && formData.diasParaVencer <= 0) {
    errors.diasParaVencer = 'Dias para vencer deve ser maior que 0';
  }

  return errors;
};
