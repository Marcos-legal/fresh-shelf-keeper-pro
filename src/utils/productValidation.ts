import { ProductFormData } from "@/types/product";

const normalizeMonth = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const MONTHS = [
  'JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

const isValidCalendarDate = (year: number, month: number, day: number) => {
  if (month < 1 || month > 12 || day < 1) return false;
  const lastDay = new Date(year, month, 0).getDate();
  return day <= lastDay;
};

const parseValidadeDate = (validade: string): Date | undefined => {
  if (!validade || validade.trim() === '') return undefined;

  const value = validade.trim();

  try {
    // Formato DD/MM/AAAA — somente ano com 4 dígitos.
    const fullDateMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (fullDateMatch) {
      const day = Number(fullDateMatch[1]);
      const month = Number(fullDateMatch[2]);
      const year = Number(fullDateMatch[3]);

      if (!isValidCalendarDate(year, month, day)) return undefined;
      return new Date(year, month - 1, day);
    }

    // Formato Mês/Ano — aceita meses em português com ou sem acento.
    const monthYearMatch = value.match(/^([^/]+)\/(\d{4})$/);
    if (monthYearMatch) {
      const monthText = normalizeMonth(monthYearMatch[1]);
      const year = Number(monthYearMatch[2]);
      const monthIndex = MONTHS.indexOf(monthText);

      if (monthIndex === -1) return undefined;

      // Para Mês/Ano, a validade é considerada até o último dia daquele mês.
      return new Date(year, monthIndex + 1, 0);
    }

    return undefined;
  } catch (error) {
    console.warn('Erro ao parsear data de validade:', validade, error);
    return undefined;
  }
};

export const validateProductForm = (formData: ProductFormData): Partial<Record<keyof ProductFormData, string>> => {
  const errors: Partial<Record<keyof ProductFormData, string>> = {};

  if (formData.validade && formData.validade.trim() !== '') {
    const validadeDate = parseValidadeDate(formData.validade);
    if (!validadeDate || Number.isNaN(validadeDate.getTime())) {
      errors.validade = 'Formato inválido. Use DD/MM/AAAA ou Mês/Ano (ex.: 31/12/2026 ou Dezembro/2026).';
    }
  }

  if (formData.diasParaVencer !== undefined && formData.diasParaVencer < 0) {
    errors.diasParaVencer = 'Dias para vencer deve ser maior ou igual a 0';
  }

  return errors;
};

export { parseValidadeDate };
