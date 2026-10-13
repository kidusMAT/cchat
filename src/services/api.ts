const API_BASE = 'http://127.0.0.1:8000/api';

export interface UserProfile {
  id: number;
  handle: string;
  display_name: string;
  avatar_url: string;
  bio: string;
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
  sender_name: string;
  sender_handle: string;
  sender_avatar: string;
  is_maya: boolean;
  text: string;
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
  messages: Array<{
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
  }>;
}

export const cchatApi = {
  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me/`);
    if (!res.ok) throw new Error('Failed to load user profile');
    return res.json();
  },

  async getChats(): Promise<ChatSummary[]> {
    const res = await fetch(`${API_BASE}/chats/`);
    if (!res.ok) throw new Error('Failed to load chats');
    const data = await res.json();
    return data.results || data;
  },

  async getChatDetail(id: number | string): Promise<ChatDetail> {
    const res = await fetch(`${API_BASE}/chats/${id}/`);
    if (!res.ok) throw new Error(`Failed to load chat ${id}`);
    return res.json();
  },

  async sendMessage(chatId: number | string, text: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/chats/${chatId}/send_message/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async publishExcerpt(chatId: number | string, title: string, topic: string) {
    const res = await fetch(`${API_BASE}/chats/${chatId}/publish/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, topic }),
    });
    if (!res.ok) throw new Error('Failed to publish');
    return res.json();
  },

  async removePublication(chatId: number | string) {
    const res = await fetch(`${API_BASE}/chats/${chatId}/remove_publication/`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to remove publication');
    return res.json();
  },

  async getExcerpts(params?: { tab?: string; topic?: string }): Promise<PublicExcerptItem[]> {
    const query = new URLSearchParams();
    if (params?.tab) query.set('tab', params.tab);
    if (params?.topic) query.set('topic', params.topic);

    const res = await fetch(`${API_BASE}/excerpts/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load excerpts');
    const data = await res.json();
    return data.results || data;
  },

  async reactMessage(msgId: number, type: 'heart' | 'cap' | 'skull' | 'fire') {
    const res = await fetch(`${API_BASE}/excerpts/messages/${msgId}/react/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) throw new Error('Failed to react');
    return res.json();
  },

  async toggleSaveExcerpt(excerptId: number) {
    const res = await fetch(`${API_BASE}/excerpts/${excerptId}/toggle_save/`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle save');
    return res.json();
  },

  async submitReport(reason: string, context: string) {
    const res = await fetch(`${API_BASE}/moderation/report/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, context }),
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return res.json();
  },

  async submitInquiry(data: { name: string; brand: string; email: string; placement_interest: string; idea: string; agreed_terms: boolean }) {
    const res = await fetch(`${API_BASE}/sponsorship/inquiry/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit inquiry');
    return res.json();
  },

  async getAfterHoursDetail() {
    const res = await fetch(`${API_BASE}/sponsorship/after-hours/`);
    if (!res.ok) throw new Error('Failed to load After Hours detail');
    return res.json();
  },
};
