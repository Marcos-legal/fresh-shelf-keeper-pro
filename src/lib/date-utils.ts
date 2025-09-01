import { format, parseISO, isValid, differenceInDays, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos para melhor type safety
export type DateFormat = 'dd/MM/yyyy' | 'yyyy-MM-dd' | 'dd/MM/yyyy HH:mm' | 'PPP' | 'pp';

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  date?: Date;
}

/**
 * Formata uma data usando date-fns com locale brasileiro
 */
export function formatDate(date: Date | string | null | undefined, dateFormat: DateFormat = 'dd/MM/yyyy'): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to formatDate:', date);
      return '';
    }
    
    return format(dateObj, dateFormat, { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Converte string para Date com validação robusta
 */
export function parseDate(dateString: string): DateValidationResult {
  if (!dateString || typeof dateString !== 'string') {
    return {
      isValid: false,
      error: 'Data não fornecida ou inválida'
    };
  }

  try {
    // Tentar diferentes formatos
    let date: Date | null = null;
    
    // Formato ISO (yyyy-MM-dd ou yyyy-MM-ddTHH:mm:ss)
    if (dateString.includes('-')) {
      date = parseISO(dateString);
    }
    // Formato brasileiro (dd/MM/yyyy)
    else if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    // Tentar parse direto
    else {
      date = new Date(dateString);
    }

    if (!date || !isValid(date)) {
      return {
        isValid: false,
        error: 'Formato de data inválido'
      };
    }

    return {
      isValid: true,
      date
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Erro ao processar data'
    };
  }
}

/**
 * Converte Date para string no formato ISO (yyyy-MM-dd)
 */
export function toISODateString(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error converting to ISO date string:', error);
    return '';
  }
}

/**
 * Converte Date para string no formato brasileiro (dd/MM/yyyy)
 */
export function toBrazilianDateString(date: Date | string | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy');
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysBetween(startDate: Date | string, endDate: Date | string): number {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(start) || !isValid(end)) {
      return 0;
    }
    
    return differenceInDays(end, start);
  } catch (error) {
    console.error('Error calculating days between dates:', error);
    return 0;
  }
}

/**
 * Adiciona dias a uma data
 */
export function addDaysToDate(date: Date | string, days: number): Date | null {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return null;
    }
    
    return addDays(dateObj, days);
  } catch (error) {
    console.error('Error adding days to date:', error);
    return null;
  }
}

/**
 * Verifica se uma data está no passado
 */
export function isDateInPast(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return false;
    }
    
    const today = startOfDay(new Date());
    const checkDate = startOfDay(dateObj);
    
    return checkDate < today;
  } catch (error) {
    console.error('Error checking if date is in past:', error);
    return false;
  }
}

/**
 * Verifica se uma data está no futuro
 */
export function isDateInFuture(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return false;
    }
    
    const today = startOfDay(new Date());
    const checkDate = startOfDay(dateObj);
    
    return checkDate > today;
  } catch (error) {
    console.error('Error checking if date is in future:', error);
    return false;
  }
}

/**
 * Calcula dias para vencimento
 */
export function daysUntilExpiry(expiryDate: Date | string): number {
  return daysBetween(new Date(), expiryDate);
}

/**
 * Determina status baseado em dias para vencimento
 */
export function getExpiryStatus(expiryDate: Date | string, warningDays = 7): 'valid' | 'warning' | 'expired' {
  const days = daysUntilExpiry(expiryDate);
  
  if (days < 0) return 'expired';
  if (days <= warningDays) return 'warning';
  return 'valid';
}

/**
 * Valida se uma string é uma data válida
 */
export function isValidDateString(dateString: string): boolean {
  const result = parseDate(dateString);
  return result.isValid;
}

/**
 * Converte qualquer valor para Date com fallback seguro
 */
export function safeParseDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  try {
    // Se já é uma Date
    if (dateValue instanceof Date) {
      return isValid(dateValue) ? dateValue : null;
    }
    
    // Se é string
    if (typeof dateValue === 'string') {
      const result = parseDate(dateValue);
      return result.isValid ? result.date! : null;
    }
    
    // Se é objeto complexo (do localStorage)
    if (typeof dateValue === 'object') {
      if (dateValue._type === 'Date' && dateValue.value) {
        if (dateValue.value.iso) {
          const date = parseISO(dateValue.value.iso);
          return isValid(date) ? date : null;
        }
      }
      
      // Tentar converter diretamente
      const date = new Date(dateValue);
      return isValid(date) ? date : null;
    }
    
    // Tentar conversão direta
    const date = new Date(dateValue);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error in safeParseDate:', error);
    return null;
  }
}