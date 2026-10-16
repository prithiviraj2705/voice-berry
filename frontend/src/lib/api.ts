const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

/**
 * The API can be colocated with the frontend in production or run on port 3000
 * during local development. Set VITE_API_URL when the server has a separate URL.
 */
export const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    console.error(`Network request failed: ${apiUrl(path)}`, error);
    throw new Error('The booking server is unavailable. Please check your connection and try again.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof payload.error === 'string' ? payload.error : `Request failed (${response.status})`;
    throw new Error(detail);
  }
  return payload as T;
}
