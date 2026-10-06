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

export const isMissing = (error) => error?.status === 404 || error?.status === 400;

// Joins server field errors into one readable line, otherwise falls back to the message.
export const getErrorDetails = (error, fallback) => {
  const details = error?.data?.errors;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((item) => item.message).join('. ');
  }
  return getErrorMessage(error, fallback);
};