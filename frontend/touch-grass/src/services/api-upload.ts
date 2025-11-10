// services/api-upload.ts
import { AuthService } from '@/services/auth';

/**
 * Authenticated fetch for multipart/FormData uploads.
 * IMPORTANT: Do NOT set Content-Type here; fetch will add the boundary.
 */
export async function secureFileUpload(url: string, formData: FormData): Promise<Response> {
  const token = await AuthService.getIdToken();
  if (!token) throw new Error('No token available');

  return fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

