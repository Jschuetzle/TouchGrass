import { AuthService } from './auth';

export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await AuthService.getIdToken();
  if (!token) throw new Error('No token available');

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}
