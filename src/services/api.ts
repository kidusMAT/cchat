// Dynamic API base URL: defaults to relative '/api' or VITE_API_URL if provided
const ENV_URL = import.meta.env.VITE_API_URL;
const API_BASE = ENV_URL ? `${ENV_URL.replace(/\/$/, '')}/api` : '/api';

export interface UserProfile {
  id: number;
  username?: string;
  email?: string;
  handle: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  created_at?: string;
  is_staff?: boolean;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

export interface ChatSummary {
  id: number;
  title: string;
  initials: string;
  tag: string;
  preview: string;
  is_published: boolean;
  participants_summary: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  conversation?: number;
  sender?: number;
  sender_name: string;
  sender_handle: string;
  sender_avatar: string;
  is_maya: boolean;
  is_self?: boolean;
  is_read?: boolean;
  text: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  is_edited?: boolean;
  quick_reactions?: Record<string, string[]>;
  reply_to?: number | null;
  reply_to_text?: string | null;
  reply_to_sender?: string | null;
  is_excerpt_eligible: boolean;
  created_at: string;
}

export interface ChatDetail extends ChatSummary {
  messages: ChatMessage[];
  active_excerpt?: {
    id: number;
    title: string;
    topic: string;
    reads_count: number;
    messages_count: number;
  } | null;
}

export interface ExcerptMessage {
  id: number;
  text: string;
  sender_display: string;
  sender_handle: string | null;
  sender_avatar: string | null;
  is_anonymous: boolean;
  reactions: {
    heart: number;
    cap: number;
    skull: number;
    fire: number;
    user_reacted: string | null;
    dominant: string;
  };
  created_at: string;
}

export interface PublicExcerptItem {
  id: number;
  title: string;
  topic: {
    id: number;
    tag: string;
    name: string;
    chats_count: number;
  };
  reads_count: number;
  authors_summary: string;
  is_saved: boolean;
  messages: ExcerptMessage[];
  created_at: string;
}

export interface TopicItem {
  id: number;
  tag: string;
  name: string;
  chats_count: number;
}

export interface SavedExcerptItem {
  id: number;
  excerpt: PublicExcerptItem;
  collection_name: string;
  created_at: string;
}

export interface AfterHoursDetail {
  brand_name: string;
  headline: string;
  tagline: string;
  image_url: string;
  menu_items: Array<{ name: string; description: string }>;
  tracks: Array<{ title: string; description: string }>;
}

// Token helper methods
const TOKEN_KEY = 'cchat_auth_token';

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore
    }
  },
};

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Token ${token}`);
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  return fetch(url, { ...options, headers });
}

export const cchatApi = {
  // Authentication
  async demoLogin(identifier: string = 'maya'): Promise<{ token: string; user: UserProfile }> {
    const res = await apiFetch('/auth/demo-login/', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
    if (!res.ok) throw new Error('Demo login failed');
    const data = await res.json();
    authStorage.setToken(data.token);
    return data;
  },

  async login(username: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    authStorage.setToken(data.token);
    return data;
  },

  async register(data: {
    username: string;
    password: string;
    handle: string;
    display_name: string;
    email?: string;
  }): Promise<{ token: string; user: UserProfile }> {
    const res = await apiFetch('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || JSON.stringify(err));
    }
    const resData = await res.json();
    authStorage.setToken(resData.token);
    return resData;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout/', { method: 'POST' });
    } finally {
      authStorage.setToken(null);
    }
  },

  async getMe(): Promise<UserProfile> {
    const res = await apiFetch('/auth/me/');
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        authStorage.setToken(null);
      }
      throw new Error('Failed to load user profile');
    }
    return res.json();
  },

  async updateMe(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiFetch('/auth/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update profile' }));
      throw new Error(err.detail || 'Failed to update profile');
    }
    return res.json();
  },

  async getUsers(): Promise<UserProfile[]> {
    const res = await apiFetch('/users/');
    if (!res.ok) throw new Error('Failed to load users');
    const data = await res.json();
    return data.results || data;
  },

  async getFollowing(): Promise<UserProfile[]> {
    const res = await apiFetch('/users/following/');
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || data;
  },

  async toggleFollow(targetIdOrHandle: number | string): Promise<{ is_following: boolean; following_count: number; followers_count: number }> {
    const res = await apiFetch(`/users/${targetIdOrHandle}/toggle_follow/`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update follow status' }));
      throw new Error(err.detail || 'Failed to update follow status');
    }
    return res.json();
  },

  async getUserProfile(idOrHandle: number | string): Promise<UserProfile> {
    const cleanLookup = typeof idOrHandle === 'string' ? idOrHandle.trim() : idOrHandle;
    const res = await apiFetch(`/users/${cleanLookup}/`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  // Conversations
  async getChats(): Promise<ChatSummary[]> {
    const res = await apiFetch('/chats/');
    if (!res.ok) throw new Error('Failed to load chats');
    const data = await res.json();
    return data.results || data;
  },

  async getChatDetail(id: number | string): Promise<ChatDetail> {
    const res = await apiFetch(`/chats/${id}/`);
    if (!res.ok) throw new Error(`Failed to load chat ${id}`);
    return res.json();
  },

  async createChat(
    recipientIdOrHandle: number | string,
    text?: string,
    title?: string,
    attachment?: { url: string; name: string; type: string }
  ): Promise<ChatDetail> {
    const body: Record<string, any> = {};
    if (typeof recipientIdOrHandle === 'number') {
      body.recipient_id = recipientIdOrHandle;
    } else {
      body.recipient_handle = recipientIdOrHandle;
    }
    if (text) body.text = text;
    if (title) body.title = title;
    if (attachment) {
      body.attachment_url = attachment.url;
      body.attachment_name = attachment.name;
      body.attachment_type = attachment.type;
    }

    const res = await apiFetch('/chats/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to start chat');
    return res.json();
  },

  async sendMessage(
    chatId: number | string,
    text: string,
    attachment?: { url: string; name: string; type: string },
    replyToId?: number
  ): Promise<ChatMessage> {
    const body: Record<string, any> = { text };
    if (attachment) {
      body.attachment_url = attachment.url;
      body.attachment_name = attachment.name;
      body.attachment_type = attachment.type;
    }
    if (replyToId) {
      body.reply_to = replyToId;
    }
    const res = await apiFetch(`/chats/${chatId}/send_message/`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send message' }));
      throw new Error(err.detail || 'Failed to send message');
    }
    return res.json();
  },

  async editMessage(chatId: number | string, messageId: number | string, text: string): Promise<ChatMessage> {
    const res = await apiFetch(`/chats/${chatId}/messages/${messageId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to edit message' }));
      throw new Error(err.detail || 'Failed to edit message');
    }
    return res.json();
  },

  async deleteMessage(chatId: number | string, messageId: number | string): Promise<void> {
    const res = await apiFetch(`/chats/${chatId}/messages/${messageId}/delete/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete message' }));
      throw new Error(err.detail || 'Failed to delete message');
    }
  },

  async reactChatMessage(chatId: number | string, messageId: number | string, emoji: string): Promise<ChatMessage> {
    const res = await apiFetch(`/chats/${chatId}/messages/${messageId}/react/`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to react to message' }));
      throw new Error(err.detail || 'Failed to react to message');
    }
    return res.json();
  },

  async pinMessage(chatId: number | string, messageId: number | string): Promise<{ is_pinned: boolean; pinned_message_id: number | null }> {
    const res = await apiFetch(`/chats/${chatId}/messages/${messageId}/pin/`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to pin message');
    return res.json();
  },

  async publishExcerpt(chatId: number | string, title: string, topic: string) {
    const res = await apiFetch(`/chats/${chatId}/publish/`, {
      method: 'POST',
      body: JSON.stringify({ title, topic }),
    });
    if (!res.ok) throw new Error('Failed to publish excerpt');
    return res.json();
  },

  async removePublication(chatId: number | string) {
    const res = await apiFetch(`/chats/${chatId}/remove_publication/`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to remove publication');
    return res.json();
  },

  // Excerpts & Feed
  async getExcerpts(params?: { tab?: string; topic?: string; publisher?: string }): Promise<PublicExcerptItem[]> {
    const query = new URLSearchParams();
    if (params?.tab) query.set('tab', params.tab.toLowerCase());
    if (params?.topic) query.set('topic', params.topic);
    if (params?.publisher) query.set('publisher', params.publisher);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch(`/excerpts/${queryString}`);
    if (!res.ok) throw new Error('Failed to load excerpts');
    const data = await res.json();
    return data.results || data;
  },

  async reactMessage(msgId: number, type: 'heart' | 'cap' | 'skull' | 'fire') {
    const res = await apiFetch(`/excerpts/messages/${msgId}/react/`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to react' }));
      throw new Error(err.detail || 'Failed to react');
    }
    return res.json();
  },

  async toggleSaveExcerpt(excerptId: number): Promise<{ saved: boolean; detail: string }> {
    const res = await apiFetch(`/excerpts/${excerptId}/toggle_save/`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle save');
    return res.json();
  },

  async recordRead(excerptId: number): Promise<{ reads_count: number }> {
    const res = await apiFetch(`/excerpts/${excerptId}/record_read/`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to record read');
    return res.json();
  },

  async getSavedExcerpts(): Promise<SavedExcerptItem[]> {
    const res = await apiFetch('/saved/');
    if (!res.ok) throw new Error('Failed to load saved excerpts');
    const data = await res.json();
    return data.results || data;
  },

  async getTopics(): Promise<TopicItem[]> {
    const res = await apiFetch('/topics/');
    if (!res.ok) throw new Error('Failed to load topics');
    const data = await res.json();
    return data.results || data;
  },

  // Moderation & Privacy
  async submitReport(reason: string, context: string) {
    const res = await apiFetch('/moderation/report/', {
      method: 'POST',
      body: JSON.stringify({ reason, context }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit report' }));
      throw new Error(err.detail || 'Failed to submit report');
    }
    return res.json();
  },

  async submitPrivacyRequest(data: {
    name?: string;
    email: string;
    request_type: string;
    details: string;
  }) {
    const res = await apiFetch('/privacy/request/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit privacy request' }));
      throw new Error(err.detail || 'Failed to submit privacy request');
    }
    return res.json();
  },

  // Sponsorship
  async submitInquiry(data: {
    name: string;
    brand: string;
    email: string;
    placement_interest: string;
    idea: string;
    agreed_terms: boolean;
  }) {
    const res = await apiFetch('/sponsorship/inquiry/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit inquiry' }));
      throw new Error(err.detail || 'Failed to submit inquiry');
    }
    return res.json();
  },

  async getAfterHoursDetail(): Promise<AfterHoursDetail> {
    const res = await apiFetch('/sponsorship/after-hours/');
    if (!res.ok) throw new Error('Failed to load After Hours detail');
    return res.json();
  },

  // ── Admin-only API ────────────────────────────────────────────
  async getAdminStats(): Promise<{
    total_users: number;
    total_public_chats: number;
    total_reactions: number;
    total_reads: number;
    total_topics: number;
    new_this_week: number;
  }> {
    const res = await apiFetch('/admin/stats/');
    if (!res.ok) throw new Error('Failed to load admin stats');
    return res.json();
  },

  async getAdminReports(): Promise<Array<{
    id: number; reason: string; context: string; status: string; reporter: string; created_at: string;
  }>> {
    const res = await apiFetch('/admin/reports/');
    if (!res.ok) throw new Error('Failed to load reports');
    return res.json();
  },

  async patchReport(id: number, status: string): Promise<{ detail: string; status: string }> {
    const res = await apiFetch(`/admin/reports/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update report');
    return res.json();
  },

  async getAdminPrivacyRequests(): Promise<Array<{
    id: number; name: string; email: string; request_type: string; details: string; status: string; created_at: string;
  }>> {
    const res = await apiFetch('/admin/privacy-requests/');
    if (!res.ok) throw new Error('Failed to load privacy requests');
    return res.json();
  },

  async patchPrivacyRequest(id: number, status: string): Promise<{ detail: string; status: string }> {
    const res = await apiFetch(`/admin/privacy-requests/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update privacy request');
    return res.json();
  },

  async getAdminInquiries(): Promise<Array<{
    id: number; name: string; brand: string; email: string; placement_interest: string;
    idea: string; agreed_terms: boolean; status: string; created_at: string;
  }>> {
    const res = await apiFetch('/admin/inquiries/');
    if (!res.ok) throw new Error('Failed to load inquiries');
    return res.json();
  },

  async patchInquiry(id: number, status: string): Promise<{ detail: string; status: string }> {
    const res = await apiFetch(`/admin/inquiries/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update inquiry');
    return res.json();
  },
};
