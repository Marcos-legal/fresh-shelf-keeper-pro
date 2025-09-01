// Tipos específicos e bem definidos para substituir 'any'

export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface DatabaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends DatabaseRow {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface SupabaseError {
  code: string;
  message: string;
  details: string;
  hint?: string;
}

// Tipos para localStorage com validação
export interface StorageData<T = any> {
  version: string;
  timestamp: number;
  data: T;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Tipos para hooks personalizados
export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export interface UseFormState<T> {
  data: T;
  errors: FormErrors;
  loading: boolean;
  isValid: boolean;
  setField: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  clearErrors: () => void;
  reset: () => void;
}