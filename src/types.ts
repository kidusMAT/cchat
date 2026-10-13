export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system' | 'narrator';
  senderName: string;
  avatar?: string;
  content: string;
  timestamp: string;
  variant?: 'blue' | 'plum' | 'amber' | 'neutral';
  tokens?: number;
  model?: string;
  liked?: boolean;
}

export interface CharacterPersona {
  id: string;
  name: string;
  title: string;
  avatar: string;
  coverImage?: string;
  description: string;
  tags: string[];
  systemPrompt: string;
  temperature: number;
  topP: number;
  contextLength: number;
  scenario: string;
  greeting: string;
  activeMemory: string;
  alternateGreetings?: string[];
}

export interface ChatSession {
  id: string;
  characterId: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  branchCount: number;
  pinned?: boolean;
}

export interface GenerationSettings {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
  streaming: boolean;
  autoSummary: boolean;
  memoryEnabled: boolean;
}
