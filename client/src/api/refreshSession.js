const API_URL = import.meta.env.VITE_API_URL;

let inFlight = null;

// Resolves to { user, accessToken } on success, or null if there is no valid session.
export const refreshSession = () => {
  if (!inFlight) {
    inFlight = fetch(`${API_URL}/auth/refresh-token`, { method: 'POST', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return null;
        const body = await response.json();
        return body.data;
      })
      .catch(() => null)
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
};
