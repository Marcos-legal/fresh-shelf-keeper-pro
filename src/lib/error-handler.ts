import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface ErrorDetail {
  code: string;
  message: string;
  type: 'auth' | 'database' | 'network' | 'validation' | 'system';
  userMessage: string;
}

// Mapeamento de erros do Supabase para mensagens em português
const ERROR_TRANSLATIONS: Record<string, ErrorDetail> = {
  // Erros de autenticação
  'invalid_credentials': {
    code: 'invalid_credentials',
    message: 'Invalid login credentials',
    type: 'auth',
    userMessage: 'Email ou senha incorretos'
  },
  'email_not_confirmed': {
    code: 'email_not_confirmed',
    message: 'Email not confirmed',
    type: 'auth',
    userMessage: 'Confirme seu email antes de fazer login'
  },
  'signup_disabled': {
    code: 'signup_disabled',
    message: 'Signup is disabled',
    type: 'auth',
    userMessage: 'Cadastro desabilitado no momento'
  },
  'email_address_invalid': {
    code: 'email_address_invalid',
    message: 'Invalid email address',
    type: 'validation',
    userMessage: 'Email inválido'
  },
  'password_too_short': {
    code: 'password_too_short',
    message: 'Password should be at least 6 characters',
    type: 'validation',
    userMessage: 'A senha deve ter pelo menos 6 caracteres'
  },
  'weak_password': {
    code: 'weak_password',
    message: 'Password is too weak',
    type: 'validation',
    userMessage: 'Senha muito fraca. Use letras, números e símbolos'
  },
  'email_address_already_registered': {
    code: 'email_address_already_registered',
    message: 'User already registered',
    type: 'auth',
    userMessage: 'Este email já está cadastrado'
  },
  'rate_limit_exceeded': {
    code: 'rate_limit_exceeded',
    message: 'Too many requests',
    type: 'network',
    userMessage: 'Muitas tentativas. Tente novamente em alguns minutos'
  },
  // Erros de banco de dados
  'row_level_security_violation': {
    code: 'row_level_security_violation',
    message: 'RLS violation',
    type: 'database',
    userMessage: 'Você não tem permissão para realizar esta ação'
  },
  'foreign_key_violation': {
    code: 'foreign_key_violation',
    message: 'Foreign key constraint violation',
    type: 'database',
    userMessage: 'Erro de relacionamento de dados'
  },
  'unique_violation': {
    code: 'unique_violation',
    message: 'Unique constraint violation',
    type: 'database',
    userMessage: 'Este item já existe'
  },
  // Erros de rede
  'network_error': {
    code: 'network_error',
    message: 'Network error',
    type: 'network',
    userMessage: 'Erro de conexão. Verifique sua internet'
  },
  'timeout': {
    code: 'timeout',
    message: 'Request timeout',
    type: 'network',
    userMessage: 'Tempo limite excedido. Tente novamente'
  }
};

export class AppError extends Error {
  public readonly code: string;
  public readonly type: ErrorDetail['type'];
  public readonly userMessage: string;
  public readonly originalError?: unknown;

  constructor(errorDetail: ErrorDetail, originalError?: unknown) {
    super(errorDetail.message);
    this.code = errorDetail.code;
    this.type = errorDetail.type;
    this.userMessage = errorDetail.userMessage;
    this.originalError = originalError;
    this.name = 'AppError';
  }
}

export function translateSupabaseError(error: any): ErrorDetail {
  // Se já é um AppError, retornar os detalhes
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      type: error.type,
      userMessage: error.userMessage
    };
  }

  // Extrair código de erro
  let errorCode = error?.code || error?.error_code || error?.message;
  
  // Lidar com diferentes formatos de erro do Supabase
  if (typeof error === 'string') {
    errorCode = error;
  } else if (error?.message) {
    errorCode = error.message;
  }

  // Verificar se temos tradução para este erro
  const translation = ERROR_TRANSLATIONS[errorCode];
  if (translation) {
    return translation;
  }

  // Verificar padrões comuns
  if (errorCode?.includes('invalid_credentials') || errorCode?.includes('Invalid login')) {
    return ERROR_TRANSLATIONS.invalid_credentials;
  }
  
  if (errorCode?.includes('email') && errorCode?.includes('not') && errorCode?.includes('confirmed')) {
    return ERROR_TRANSLATIONS.email_not_confirmed;
  }
  
  if (errorCode?.includes('already') && errorCode?.includes('registered')) {
    return ERROR_TRANSLATIONS.email_address_already_registered;
  }
  
  if (errorCode?.includes('rate') && errorCode?.includes('limit')) {
    return ERROR_TRANSLATIONS.rate_limit_exceeded;
  }

  // Erro genérico
  return {
    code: 'unknown_error',
    message: errorCode || 'Unknown error',
    type: 'system',
    userMessage: 'Ocorreu um erro inesperado. Tente novamente'
  };
}

export function handleError(error: unknown, showToast = true): ErrorDetail {
  const errorDetail = translateSupabaseError(error);
  
  // Log do erro para debugging
  console.error('Error handled:', {
    code: errorDetail.code,
    type: errorDetail.type,
    message: errorDetail.message,
    userMessage: errorDetail.userMessage,
    originalError: error
  });

  // Mostrar toast se solicitado
  if (showToast) {
    toast({
      title: "Erro",
      description: errorDetail.userMessage,
      variant: "destructive",
    });
  }

  return errorDetail;
}

export function handleDatabaseError(error: PostgrestError, showToast = true): ErrorDetail {
  const errorDetail: ErrorDetail = {
    code: error.code || 'database_error',
    message: error.message,
    type: 'database',
    userMessage: translateSupabaseError(error).userMessage
  };

  if (showToast) {
    toast({
      title: "Erro no banco de dados",
      description: errorDetail.userMessage,
      variant: "destructive",
    });
  }

  return errorDetail;
}

export function handleNetworkError(error: unknown, showToast = true): ErrorDetail {
  const errorDetail: ErrorDetail = {
    code: 'network_error',
    message: 'Network error occurred',
    type: 'network',
    userMessage: 'Erro de conexão. Verifique sua internet e tente novamente'
  };

  if (showToast) {
    toast({
      title: "Erro de conexão",
      description: errorDetail.userMessage,
      variant: "destructive",
    });
  }

  return errorDetail;
}