import { useState, useEffect, useCallback, useRef } from 'react';
import { request } from '../api/client';

// Loads data from the server (GET) and gives back everything a screen needs:
//   data     - the answer from the server (null until it arrives)
//   loading  - true while a request is running
//   error    - a message to show, or null
//   refetch  - call it to load again (Retry button, pull to refresh, after a change)
export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mounted = useRef(true);
  const latestRequest = useRef(0);

  const fetchData = useCallback(async () => {
    // Number every request, so a slow old answer cannot overwrite a newer one.
    const requestId = ++latestRequest.current;
    const isCurrent = () => mounted.current && requestId === latestRequest.current;

    setLoading(true);
    setError(null);
    try {
      const result = await request(path);
      if (isCurrent()) setData(result);
    } catch (err) {
      if (isCurrent()) setError(err.message);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    // Cleanup: do not touch state after the screen has been closed.
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
