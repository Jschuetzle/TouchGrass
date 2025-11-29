
import { AuthService } from './auth';

export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await AuthService.getIdToken();
  if (!token) {
    console.error('secureFetch: No token available');
    throw new Error('No token available');
  }

  const method = options.method ?? 'GET';

  // Merge headers (preserve any existing ones)
  const headers: HeadersInit = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  // ---- Log request body nicely ----
  let requestBodyForLog: unknown = undefined;

  if (options.body instanceof FormData) {
    const formObj: Record<string, unknown> = {};
    options.body.forEach((value, key) => {
      formObj[key] = value;
    });
    requestBodyForLog = formObj;
  } else if (typeof options.body === 'string') {
    try {
      requestBodyForLog = JSON.parse(options.body);
    } catch {
      requestBodyForLog = options.body; // not JSON, just string
    }
  } else if (options.body) {
    requestBodyForLog = options.body;
  }

  console.groupCollapsed(`[HTTP] ${method} ${url}`);
  console.log('Request headers:', headers);
  console.log(
    'Request body:',
    requestBodyForLog !== undefined ? requestBodyForLog : '<none>'
  );
  console.groupEnd();

  try {
    const resp = await fetch(url, {
      ...options,
      headers,
    });

    // ---- Log response ----
    const cloned = resp.clone();
    let responseBodyForLog: unknown = null;

    try {
      const text = await cloned.text();
      console.log(text);
      try {
        responseBodyForLog = JSON.parse(text);
      } catch {
        responseBodyForLog = text; // not JSON
      }
    } catch (e) {
      responseBodyForLog = `<failed to read response body: ${
        (e as Error).message
      }>`;
    }

    console.groupCollapsed(
      `[HTTP] RESPONSE ${method} ${url} -> ${resp.status} ${resp.statusText}`
    );
    console.log('Status:', resp.status, resp.statusText);
    console.log('Response body:', responseBodyForLog);
    console.groupEnd();

    return resp;
  } catch (error) {
    console.error('[HTTP] ERROR', method, url, error);
    throw error; // propagate so callers see the failure
  }
}
