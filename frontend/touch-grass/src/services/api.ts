import { AuthService } from './auth';
import Constants from 'expo-constants';

const BASE_URL = `http://${Constants.expoConfig.extra.backendIP}:3000`;

export async function secureFetch(
  route: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await AuthService.getIdToken();
  if (!token) throw new Error('No token available');

  const url = BASE_URL + route;

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}
