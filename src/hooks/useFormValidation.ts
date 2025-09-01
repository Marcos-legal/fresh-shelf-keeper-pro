import { useState, useCallback } from 'react';
import { z } from 'zod';
import { UseFormState } from '@/types/api';

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  schema?: z.ZodSchema<T>
): UseFormState<T> {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const setField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setLoading(false);
  }, [initialData]);

  const validate = useCallback(() => {
    if (!schema) return true;
    
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [data, schema]);

  const isValid = Object.keys(errors).length === 0;

  return {
    data,
    errors,
    loading,
    isValid,
    setField,
    setError,
    clearErrors,
    reset,
    validate,
    setLoading
  } as UseFormState<T> & { validate: () => boolean; setLoading: (loading: boolean) => void };
}