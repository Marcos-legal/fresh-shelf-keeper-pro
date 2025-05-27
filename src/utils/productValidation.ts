
import { ProductFormData } from "@/types/product";

export const validateProductForm = (formData: ProductFormData): Partial<ProductFormData> => {
  const errors: Partial<ProductFormData> = {};

  if (!formData.nome.trim()) errors.nome = 'Nome é obrigatório';
  if (!formData.lote.trim()) errors.lote = 'Lote é obrigatório';
  if (!formData.marca.trim()) errors.marca = 'Marca é obrigatória';
  if (!formData.dataFabricacao) errors.dataFabricacao = 'Data de fabricação é obrigatória';
  if (!formData.validade) errors.validade = 'Data de validade é obrigatória';
  if (!formData.responsavel.trim()) errors.responsavel = 'Responsável é obrigatório';
  if (formData.diasParaVencer <= 0) errors.diasParaVencer = 'Dias para vencer deve ser maior que 0';

  // Validar se a data de validade é posterior à fabricação
  if (formData.dataFabricacao && formData.validade) {
    const fabricacao = new Date(formData.dataFabricacao);
    const validade = new Date(formData.validade);
    if (validade <= fabricacao) {
      errors.validade = 'Data de validade deve ser posterior à fabricação';
    }
  }

  // Validar se a data de abertura é posterior à fabricação
  if (formData.dataFabricacao && formData.dataAbertura) {
    const fabricacao = new Date(formData.dataFabricacao);
    const abertura = new Date(formData.dataAbertura);
    if (abertura < fabricacao) {
      errors.dataAbertura = 'Data de abertura não pode ser anterior à fabricação';
    }
  }

  return errors;
};
