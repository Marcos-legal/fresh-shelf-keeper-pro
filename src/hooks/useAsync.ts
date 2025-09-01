import { useState, useCallback } from 'react';
import { UseAsyncState } from '@/types/api';
import { handleError } from '@/lib/error-handler';

export function useAsync<T = any>(): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<T>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      const errorDetail = handleError(err, false);
      setError(errorDetail.userMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}