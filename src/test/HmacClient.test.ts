import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HmacClient from '../services/HmacClient';

// Polyfill Web Crypto for jsdom
const subtle = crypto.subtle;

describe('HmacClient', () => {
  const SECRET = 'test-secret';
  const BASE_URL = 'https://api.example.com';
  let client: HmacClient;

  beforeEach(() => {
    client = new HmacClient(SECRET, BASE_URL);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('constructs with correct base URL', () => {
    expect(client.apiBaseUrl).toBe(BASE_URL);
  });

  it('GET request calls fetch with correct URL', async () => {
    const mockResponse = { id: 1 };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const result = await client.get<{ id: number }>('/api/test');

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/api/test`);
    expect((options as RequestInit).method).toBe('GET');
    expect(result).toEqual(mockResponse);
  });

  it('GET request does not include HMAC signature', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await client.get('/api/test');

    const [, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = (options as RequestInit).headers as Record<string, string>;
    expect(headers['X-HMAC-Signature']).toBeUndefined();
  });

  it('POST request includes HMAC signature header', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await client.post('/api/test', { data: 'value' });

    const [, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = (options as RequestInit).headers as Record<string, string>;
    expect(headers['X-HMAC-Signature']).toBeDefined();
    expect(typeof headers['X-HMAC-Signature']).toBe('string');
    expect(headers['X-HMAC-Signature'].length).toBeGreaterThan(0);
  });

  it('throws on non-OK response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    );

    await expect(client.get('/api/missing')).rejects.toThrow('Not found');
  });

  it('throws generic error when response body is not JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 500 })
    );

    // Body is not JSON so .json() catch fallback returns { error: 'Unknown error' }
    await expect(client.get('/api/fail')).rejects.toThrow('Unknown error');
  });

  it('throws HTTP status error when JSON response has no error field', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'oops' }), { status: 500 })
    );

    await expect(client.get('/api/fail')).rejects.toThrow('HTTP 500');
  });

  it('forwards AbortSignal to fetch', async () => {
    const controller = new AbortController();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await client.get('/api/test', controller.signal);

    const [, options] = fetchSpy.mock.calls[0];
    expect((options as RequestInit).signal).toBe(controller.signal);
  });

  it('HMAC signatures are consistent for the same payload', async () => {
    const responses = [
      new Response(JSON.stringify({}), { status: 200 }),
      new Response(JSON.stringify({}), { status: 200 }),
    ];
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(responses[0])
      .mockResolvedValueOnce(responses[1]);

    await client.post('/api/test', { key: 'value' });
    await client.post('/api/test', { key: 'value' });

    const sig1 = ((fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>)['X-HMAC-Signature'];
    const sig2 = ((fetchSpy.mock.calls[1][1] as RequestInit).headers as Record<string, string>)['X-HMAC-Signature'];
    expect(sig1).toBe(sig2);
  });
});
