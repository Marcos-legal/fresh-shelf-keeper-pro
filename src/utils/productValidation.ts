
import { ProductFormData } from "@/types/product";

const parseValidadeDate = (validade: string): Date | undefined => {
  if (!validade || validade.trim() === '') return undefined;

  try {
    // Formato DD/MM/AAAA ou DD/MM/AA
    if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(validade)) {
      const parts = validade.split('/');
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      let year = Number(parts[2]);
      
      if (year < 100) {
        year = year < 50 ? 2000 + year : 1900 + year;
      }
      return new Date(year, month - 1, day);
    }

    // Formato MM/AAAA ou MM/AA
    if (/^\d{2}\/\d{2,4}$/.test(validade)) {
      const parts = validade.split('/');
      const month = Number(parts[0]);
      let year = Number(parts[1]);
      
      if (year < 100) {
        year = year < 50 ? 2000 + year : 1900 + year;
      }
      // Último dia do mês
      return new Date(year, month, 0);
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
