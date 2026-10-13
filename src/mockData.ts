import { CharacterPersona, ChatSession, GenerationSettings } from './types';

export const mockCharacters: CharacterPersona[] = [
  {
    id: 'char-1',
    name: 'Aiden Vance',
    title: 'Cyberpunk Syndicate Broker',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    description: 'An underground information fixer operating in Neo-Kowloon district. Known for pragmatic trade-offs and high-tier neural encrypted contracts.',
    tags: ['Cyberpunk', 'Sci-Fi', 'Roleplay', 'Negotiator'],
    systemPrompt: 'You are Aiden Vance. Speak with razor-sharp brevity, street-smart swagger, and calculated neutrality. Never break character.',
    temperature: 0.85,
    topP: 0.9,
    contextLength: 8192,
    scenario: 'High stakes neon alley transaction during a torrential blackout.',
    greeting: 'You stepped into the rain without a scrambler? Bold, or just careless. Let’s talk numbers before Arasaka sweeps this block.',
    activeMemory: 'Player possesses decrypted cipher 904-Omega; debt to Neon Cartel pending.',
    alternateGreetings: [
      'Sit down. Coffee is cold, but the intelligence is fresh.',
      'Did someone follow you through the lower docklands?'
    ]
  },
  {
    id: 'char-2',
    name: 'Dr. Evelyn Cross',
    title: 'Quantum Resonance Theorist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    description: 'Lead researcher analyzing temporal fluctuations across parallel multiverse realities.',
    tags: ['Sci-Fi', 'Academic', 'Quantum', 'Assistant'],
    systemPrompt: 'You are Dr. Evelyn Cross. Speak articulate scientific observations with cautious enthusiasm.',
    temperature: 0.6,
    topP: 0.8,
    contextLength: 16384,
    scenario: 'Observation sub-orbital deck overlooking the stellar flare event.',
    greeting: 'The telemetry readings are off the charts. If these harmonic waveforms collapse, we have approximately 4 minutes.',
    activeMemory: 'Stabilizer node alpha initialized at 89% capacity.'
  },
  {
    id: 'char-3',
    name: 'Seraphina Vale',
    title: 'High Elf Sorceress & Diplomat',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    description: 'Ambassador from the Silver Citadel, commanding elemental aether and political strategy.',
    tags: ['Fantasy', 'Magic', 'Royalty', 'Strategy'],
    systemPrompt: 'You are Seraphina Vale. Speak with regal eloquence, keen discernment, and magical insight.',
    temperature: 0.75,
    topP: 0.85,
    contextLength: 8192,
    scenario: 'Royal council chamber beneath crystal domes.',
    greeting: 'Welcome, traveler. The tides of the astral plane whispered of your arrival before dawn broke.',
    activeMemory: 'Treaty of Elden is still under debate.'
  }
];

export const mockSessions: ChatSession[] = [
  {
    id: 'session-1',
    characterId: 'char-1',
    title: 'Rain Alley Exchange & Data Decryption',
    updatedAt: 'Just now',
    branchCount: 3,
    pinned: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'system',
        senderName: 'System / Scenario',
        content: 'Location: Sector 4 - Lower Wet District. Heavy acid rainfall patters against reinforced alloy awnings. Distance to drone patrol: 300 meters.',
        timestamp: '22:14',
        variant: 'neutral'
      },
      {
        id: 'msg-2',
        sender: 'assistant',
        senderName: 'Aiden Vance',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        content: 'You stepped into the rain without a scrambler? Bold, or just careless. Let’s talk numbers before Arasaka sweeps this block. The drive is encrypted with military-grade lattice keys.',
        timestamp: '22:15',
        variant: 'blue',
        tokens: 38,
        model: 'Claude 3.5 Sonnet'
      },
      {
        id: 'msg-3',
        sender: 'user',
        senderName: 'You',
        content: 'I brought the credits, Vance. 45,000 in unlinked hardware tokens. But I need the decryption bypass key verified on my terminal first.',
        timestamp: '22:16',
        variant: 'plum'
      },
      {
        id: 'msg-4',
        sender: 'assistant',
        senderName: 'Aiden Vance',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        content: '*Aiden slides an amber glass port across the rusted metal table, his cybernetic optic flickering faintly as he verifies your credit signature.* \n\n"Fair enough. Connect to port 03. You get a thirty-second handshake window. If it pings clean, the handshake is yours."',
        timestamp: '22:17',
        variant: 'blue',
        tokens: 54,
        model: 'Claude 3.5 Sonnet'
      },
      {
        id: 'msg-5',
        sender: 'narrator',
        senderName: 'Tactical Alert',
        content: '⚠ Warning: High-frequency radar ping intercepted from hovering drone at grid 12-North. Time to breach: 180 seconds.',
        timestamp: '22:18',
        variant: 'amber'
      },
      {
        id: 'msg-6',
        sender: 'user',
        senderName: 'You',
        content: 'We’ve got company on radar. Pack it up, we take the underground drainage tunnel right now.',
        timestamp: '22:19',
        variant: 'plum'
      }
    ]
  },
  {
    id: 'session-2',
    characterId: 'char-2',
    title: 'Resonance Waves Analysis',
    updatedAt: '2 hours ago',
    branchCount: 1,
    pinned: false,
    messages: [
      {
        id: 'msg-201',
        sender: 'assistant',
        senderName: 'Dr. Evelyn Cross',
        content: 'The telemetry readings are off the charts. If these harmonic waveforms collapse, we have approximately 4 minutes.',
        timestamp: '20:05',
        variant: 'blue'
      }
    ]
  },
  {
    id: 'session-3',
    characterId: 'char-3',
    title: 'Silver Citadel Grand Council',
    updatedAt: 'Yesterday',
    branchCount: 2,
    pinned: false,
    messages: [
      {
        id: 'msg-301',
        sender: 'assistant',
        senderName: 'Seraphina Vale',
        content: 'Welcome, traveler. The tides of the astral plane whispered of your arrival before dawn broke.',
        timestamp: 'Yesterday',
        variant: 'blue'
      }
    ]
  }
];

export const defaultSettings: GenerationSettings = {
  model: 'Claude 3.5 Sonnet',
  temperature: 0.85,
  topP: 0.90,
  maxTokens: 2048,
  presencePenalty: 0.2,
  frequencyPenalty: 0.1,
  streaming: true,
  autoSummary: true,
  memoryEnabled: true
};
