import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// Filters and page live in the URL. Changing any filter resets the page.
export const useQueryState = () => {
  const [params, setParams] = useSearchParams();

  const setParam = useCallback(
    (key, value) =>
      setParams((previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        return next;
      }),
    [setParams],
  );

  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  return { params, setParam, page };
};
