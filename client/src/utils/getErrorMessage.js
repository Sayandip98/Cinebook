export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;
  if (error.status === 'FETCH_ERROR') return 'Cannot reach the server. Check your connection.';
  return error.data?.message ?? fallback;
};

export const applyFieldErrors = (error, setError) => {
  const errors = error?.data?.errors;
  if (!Array.isArray(errors)) return false;

  let applied = false;
  errors.forEach(({ field, message }) => {
    if (field) {
      setError(field, { type: 'server', message });
      applied = true;
    }
  });
  return applied;
};