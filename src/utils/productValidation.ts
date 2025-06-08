
import { ProductFormData } from "@/types/product";

const parseValidadeDate = (validade: string): Date | undefined => {
  if (!validade || validade.trim() === '') return undefined;

  try {
    // Formato DD/MM/AA
    if (/^\d{2}\/\d{2}\/\d{2}$/.test(validade)) {
      const [day, month, year] = validade.split('/').map(Number);
      const fullYear = year < 50 ? 2000 + year : 1900 + year; // Assume 2000+ para anos < 50
      return new Date(fullYear, month - 1, day);
    }

    // Formato MM/AA
    if (/^\d{2}\/\d{2}$/.test(validade)) {
      const [month, year] = validade.split('/').map(Number);
      const fullYear = year < 50 ? 2000 + year : 1900 + year;
      // Último dia do mês
      return new Date(fullYear, month, 0);
    }

    // Formato MES/ANO (ex: NOVEMBRO/2025)
    if (/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]+\/\d{4}$/.test(validade)) {
      const [mesTexto, anoTexto] = validade.split('/');
      const meses = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];
      
      const mesIndex = meses.indexOf(mesTexto.toUpperCase());
      if (mesIndex === -1) return undefined;
      
      const ano = parseInt(anoTexto);
      if (isNaN(ano)) return undefined;
      
      // Último dia do mês
      return new Date(ano, mesIndex + 1, 0);
    }

    return undefined;
  } catch (error) {
    console.warn('Erro ao parsear data de validade:', validade, error);
    return undefined;
  }
};

export const validateProductForm = (formData: ProductFormData): Partial<Record<keyof ProductFormData, string>> => {
  const errors: Partial<Record<keyof ProductFormData, string>> = {};

  // Validar formato da data de validade se fornecida
  if (formData.validade && formData.validade.trim() !== '') {
    const validadeDate = parseValidadeDate(formData.validade);
    if (!validadeDate) {
      errors.validade = 'Formato de data inválido. Use DD/MM/AA, MM/AA ou MÊS/ANO';
    }
  }

  // Validar dias para vencer apenas se fornecido
  if (formData.diasParaVencer !== undefined && formData.diasParaVencer < 0) {
    errors.diasParaVencer = 'Dias para vencer deve ser maior ou igual a 0';
  }

  return errors;
};

// Exportar função auxiliar para uso em outros lugares
export { parseValidadeDate };
