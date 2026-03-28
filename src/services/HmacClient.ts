interface RequestConfig {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class HmacClient {
  readonly #secretKey: string;
  readonly apiBaseUrl: string;

  constructor(secretKey: string, apiBaseUrl: string) {
    this.#secretKey = secretKey;
    this.apiBaseUrl = apiBaseUrl;
  }

  private async generateSignature(payload: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.#secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
      return this.arrayBufferToBase64(signature);
    } catch (error) {
      if (import.meta.env.DEV) console.error('[HMAC] Signature generation failed:', error);
      throw error;
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const method = config.method ?? 'GET';

    let body: string | undefined;
    let signature = '';

    if (method !== 'GET' && config.body !== undefined) {
      body = JSON.stringify(config.body);
      signature = await this.generateSignature(body);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers ?? {}),
    };

    if (signature) {
      headers['X-HMAC-Signature'] = signature;
    }

    if (import.meta.env.DEV) {
      console.log('[Request]', { endpoint, method, hasSignature: !!signature });
    }

    const response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined && { body }),
      ...(config.signal && { signal: config.signal }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error((err as { error?: string }).error ?? `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', signal });
  }

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }
}

export default HmacClient;
