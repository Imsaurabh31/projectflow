import { useState, useCallback } from 'react';

/**
 * Generic hook for async operations with loading/error state.
 * Usage:
 *   const { execute, loading, error, data } = useAsync(myApiFn);
 */
const useAsync = (asyncFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        setData(result);
        return { ok: true, data: result };
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'An error occurred';
        setError(message);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { execute, loading, error, data };
};

export default useAsync;
