import { z } from 'zod';

// Validação de email
export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido')
  .max(255, 'Email muito longo');

// Validação de senha
export const passwordSchema = z
  .string()
  .min(6, 'A senha deve ter pelo menos 6 caracteres')
  .max(100, 'Senha muito longa')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'
  );

// Validação de senha mais simples para desenvolvimento
export const simplePasswordSchema = z
  .string()
  .min(6, 'A senha deve ter pelo menos 6 caracteres')
  .max(100, 'Senha muito longa');

// Validação de nome
export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

// Validação de data
export const dateSchema = z
  .string()
  .refine((date) => {
    if (!date) return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Data inválida');

// Validação de quantidade
export const quantitySchema = z
  .number()
  .min(0, 'Quantidade deve ser positiva')
  .max(999999, 'Quantidade muito alta');

// Validação de produto
export const productSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  lote: z.string().max(100, 'Lote muito longo').optional(),
  marca: z.string().max(100, 'Marca muito longa').optional(),
  dataFabricacao: dateSchema.optional(),
  validade: dateSchema.optional(),
  dataAbertura: dateSchema.optional(),
  diasParaVencer: z.number().min(0).max(9999).optional(),
  localArmazenamento: z.enum(['refrigerado', 'congelado', 'ambiente', 'camara-fria']).optional(),
  responsavel: z.string().max(100, 'Responsável muito longo').optional(),
});

// Validação de produto de estoque
export const estoqueProductSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  unidade_medida: z.string().min(1, 'Unidade de medida é obrigatória').max(50, 'Unidade de medida muito longa'),
  quantidade_por_unidade: quantitySchema,
  unidade_conteudo: z.string().min(1, 'Unidade de conteúdo é obrigatória').max(50, 'Unidade de conteúdo muito longa'),
});

// Validação de contagem de estoque
export const contagemEstoqueSchema = z.object({
  produto_id: z.string().uuid('ID do produto inválido'),
  quantidade: quantitySchema,
  quantidade_extra: quantitySchema,
  unidade_quantidade_extra: z.enum(['porcoes', 'unidades']),
  responsavel: z.string().max(100, 'Responsável muito longo').optional(),
  observacoes: z.string().max(500, 'Observações muito longas').optional(),
});

// Validação de login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Validação de cadastro
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas devem ser iguais',
  path: ['confirmPassword'],
});

// Validação de cadastro simples
export const simpleSignupSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas devem ser iguais',
  path: ['confirmPassword'],
});

// Função para validar email em tempo real
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message };
    }
    return { isValid: false, error: 'Email inválido' };
  }
}

// Função para validar senha em tempo real
export function validatePassword(password: string, useStrong = false): { 
  isValid: boolean; 
  error?: string; 
  strength: 'weak' | 'medium' | 'strong';
} {
  try {
    const schema = useStrong ? passwordSchema : simplePasswordSchema;
    schema.parse(password);
    
    // Calcular força da senha
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    
    if (password.length >= 8) {
      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      const criteriasMet = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
      
      if (criteriasMet >= 3) strength = 'strong';
      else if (criteriasMet >= 2) strength = 'medium';
    }
    
    return { isValid: true, strength };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        error: error.errors[0]?.message,
        strength: 'weak'
      };
    }
    return { 
      isValid: false, 
      error: 'Senha inválida',
      strength: 'weak'
    };
  }
}

// Função para validar formulário completo
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
} {
  try {
    const validData = schema.parse(data);
    return { isValid: true, errors: {}, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Erro de validação' } };
  }
}