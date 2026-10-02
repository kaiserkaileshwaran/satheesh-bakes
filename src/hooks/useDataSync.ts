import { useState, useEffect } from 'react';

/**
 * A hook to keep a local piece of state perfectly synced with StorageService changes.
 * @param fetchFn A function that returns the data synchronously (e.g. StorageService.getOffers)
 */
export function useDataSync<T>(fetchFn: () => T): T {
  const [data, setData] = useState<T>(fetchFn);

  useEffect(() => {
    // Defer initial sync to avoid synchronous setState inside effect
    const timeout = setTimeout(() => setData(fetchFn()), 0);

    const handleUpdate = () => {
      setData(fetchFn());
    };

    window.addEventListener('sb_data_change', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('sb_data_change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  // fetchFn is intentionally excluded — callers should memoize if needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}
