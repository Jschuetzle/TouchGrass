import { AuthService } from './auth';

export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const token = await AuthService.getIdToken();
    if (!token) throw new Error('No token available');

    const resp = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    return resp;
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}
