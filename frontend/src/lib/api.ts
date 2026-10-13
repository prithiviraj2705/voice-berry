const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

/**
 * The API can be colocated with the frontend in production or run on port 3000
 * during local development. Set VITE_API_URL when the server has a separate URL.
 */
export const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload as T;
}
