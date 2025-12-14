class HmacClient {
  constructor(secretKey, apiBaseUrl) {
    this.#secretKey = secretKey;
    this.apiBaseUrl = apiBaseUrl;
  }

  #secretKey;

  async generateSignature(payload) {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.#secretKey);
      const payloadData = encoder.encode(payload);
      
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', key, payloadData);
      const base64Sig = this.arrayBufferToBase64(signature);
      
      return base64Sig;
    } catch (error) {
      console.error('[HMAC Error] Signature generation failed');
      throw error;
    }
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }

  async request(endpoint, config = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const method = config.method || 'GET';

    let body = undefined;
    let signature = '';
    
    if (method !== 'GET' && config.body) {
      body = JSON.stringify(config.body);
      signature = await this.generateSignature(body);
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    };
    
    if (signature) {
      headers['X-HMAC-Signature'] = signature;
    }
    
    // ✅ Only log safe info - no headers, no secrets
    if (process.env.NODE_ENV === 'development') {
      console.log('[Request]', {
        endpoint,
        method,
        hasSignature: !!signature,
      });
    }
    
    const response = await fetch(url, {
      method,
      headers,
      ...(body && { body }),
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