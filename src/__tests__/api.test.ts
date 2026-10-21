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

  it('publishes chat excerpt with sections and headers', async () => {
    authStorage.setToken('valid-token');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        detail: 'Excerpt published',
        excerpt_id: 42,
        title: 'Interview Lore',
        topic: '#dating',
        sections: [
          { header: 'The Resume', topic_tag: '#career', message_ids: [1, 2] },
          { header: 'The Offer', topic_tag: '#dating', message_ids: [3, 4] },
        ],
      }),
    });
    global.fetch = mockFetch;

    const sections = [
      { header: 'The Resume', topic_tag: '#career', message_ids: [1, 2] },
      { header: 'The Offer', topic_tag: '#dating', message_ids: [3, 4] },
    ];

    const res = await cchatApi.publishExcerpt(10, 'Interview Lore', '#dating', sections);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/chats/10/publish/');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      title: 'Interview Lore',
      topic: '#dating',
      sections,
    });
    expect(res.excerpt_id).toBe(42);
    expect(res.sections.length).toBe(2);
  });

  it('removes publication from chat', async () => {
    authStorage.setToken('valid-token');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ detail: 'Publication removed' }),
    });
    global.fetch = mockFetch;

    const res = await cchatApi.removePublication(10, true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/chats/10/remove_publication/');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ unpublish_all: true });
    expect(res.detail).toBe('Publication removed');
  });

  it('fetches broadcast configuration', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        is_active: true,
        badge_text: 'HOT',
        message: 'Breaking conversation published!',
        style_variant: 'violet',
        action_label: 'Read Now',
        action_url: '/tonight',
      }),
    });
    global.fetch = mockFetch;

    const res = await cchatApi.getBroadcast();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/broadcast/');
    expect(res.is_active).toBe(true);
    expect(res.badge_text).toBe('HOT');
  });

  it('updates admin broadcast configuration', async () => {
    authStorage.setToken('admin-token');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 1,
        is_active: true,
        badge_text: 'SPONSOR',
        message: 'After Hours special drops at midnight',
        style_variant: 'amber',
        action_label: 'Check Deals',
        action_url: '/after-hours',
      }),
    });
    global.fetch = mockFetch;

    const payload = {
      is_active: true,
      badge_text: 'SPONSOR',
      message: 'After Hours special drops at midnight',
      style_variant: 'amber' as const,
      action_label: 'Check Deals',
      action_url: '/after-hours',
    };

    const res = await cchatApi.updateAdminBroadcast(payload);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/admin/broadcast/');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(payload);
    expect(res.badge_text).toBe('SPONSOR');
  });

  it('fetches admin stats with reaction culture breakdown', async () => {
    authStorage.setToken('admin-token');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        total_users: 150,
        total_public_chats: 40,
        total_reactions: 890,
        total_reads: 5400,
        total_topics: 12,
        new_this_week: 5,
        reactions_breakdown: { heart: 300, cap: 250, skull: 200, fire: 140 },
        inquiries_summary: { total: 8, pending: 3, reviewed: 2, accepted: 2, rejected: 1 },
      }),
    });
    global.fetch = mockFetch;

    const res = await cchatApi.getAdminStats();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/admin/stats/');
    expect(res.reactions_breakdown?.heart).toBe(300);
    expect(res.inquiries_summary?.accepted).toBe(2);
  });
});


