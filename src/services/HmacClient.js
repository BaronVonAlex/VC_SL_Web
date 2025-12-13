class HmacClient {
  constructor(secretKey, apiBaseUrl) {
    this.secretKey = secretKey;
    this.apiBaseUrl = apiBaseUrl;
  }

  async generateSignature(payload) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.secretKey);
    const payloadData = encoder.encode(payload);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, payloadData);
    return this.arrayBufferToBase64(signature);
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }

  async request(endpoint, config = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const body = config.body ? JSON.stringify(config.body) : undefined;
    const signature = body ? await this.generateSignature(body) : '';

    const response = await fetch(url, {
      method: config.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-HMAC-Signature': signature,
        ...(config.headers || {}),
      },
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  async put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }
}

export default HmacClient;