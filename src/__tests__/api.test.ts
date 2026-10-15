import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cchatApi, authStorage } from '../services/api';

// Lightweight localStorage polyfill for Node test environment
const storageMock: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => storageMock[key] ?? null,
    setItem: (key: string, val: string) => { storageMock[key] = String(val); },
    removeItem: (key: string) => { delete storageMock[key]; },
    clear: () => {
      for (const k in storageMock) delete storageMock[k];
    },
    key: () => null,
    length: 0,
  };
}

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves authentication token', () => {
    expect(authStorage.getToken()).toBeNull();
    authStorage.setToken('test-token-12345');
    expect(authStorage.getToken()).toBe('test-token-12345');
    authStorage.setToken(null);
    expect(authStorage.getToken()).toBeNull();
  });
});

describe('cchatApi service contract', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('injects Authorization header when token is present', async () => {
    authStorage.setToken('secret-auth-key');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, handle: '@maya', display_name: 'Maya' }),
    });
    global.fetch = mockFetch;

    await cchatApi.getMe();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/auth/me/');
    expect(options.headers.get('Authorization')).toBe('Token secret-auth-key');
  });

  it('submits partner inquiries with expected payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ detail: 'Success' }),
    });
    global.fetch = mockFetch;

    const payload = {
      name: 'Alex Morgan',
      brand: 'After Hours',
      email: 'alex@example.com',
      placement_interest: 'Discover sponsor card',
      idea: 'Specialty coffee sponsorship',
      agreed_terms: true,
    };

    await cchatApi.submitInquiry(payload);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/sponsorship/inquiry/');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(payload);
  });

  it('submits privacy requests with expected payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ detail: 'Privacy request received' }),
    });
    global.fetch = mockFetch;

    const payload = {
      email: 'maya@example.com',
      request_type: 'Account data',
      details: 'Please export my chat history.',
    };

    await cchatApi.submitPrivacyRequest(payload);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/privacy/request/');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(payload);
  });

  it('reacts to public excerpt message', async () => {
    authStorage.setToken('valid-token');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        heart: 1,
        cap: 0,
        skull: 0,
        fire: 0,
        user_reacted: 'heart',
      }),
    });
    global.fetch = mockFetch;

    const res = await cchatApi.reactMessage(21, 'heart');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/excerpts/messages/21/react/');
    expect(res.user_reacted).toBe('heart');
  });

  it('handles message send to chat', async () => {
    authStorage.setToken('valid-token');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 99,
        text: 'New message',
        sender_name: 'Maya',
        sender_handle: '@mayamaybe',
      }),
    });
    global.fetch = mockFetch;

    const res = await cchatApi.sendMessage(1, 'New message');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/chats/1/send_message/');
    expect(res.text).toBe('New message');
  });
});
