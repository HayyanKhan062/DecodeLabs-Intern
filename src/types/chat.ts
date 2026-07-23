export type Role = 'user' | 'assistant' | 'system';

export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'groq' | 'openrouter' | 'deepseek';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderId;
  description: string;
  badge?: string;
  maxTokens: number;
  supportsVision: boolean;
  isDefault?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  content?: string; // Extracted text content or base64 data for images
  base64Data?: string;
  mimeType?: string;
}

export interface MessageReaction {
  liked?: boolean;
  disliked?: boolean;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  reaction?: MessageReaction;
  isError?: boolean;
  modelUsed?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
  modelId: string;
  systemPrompt?: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'blue-purple' | 'cyan-emerald' | 'violet-pink' | 'amber-orange' | 'indigo-blue';
export type FontSize = 'small' | 'medium' | 'large';
export type ChatWidth = 'compact' | 'standard' | 'wide';

export interface UserSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  chatWidth: ChatWidth;
  animationSpeed: 'normal' | 'fast' | 'none';
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  customApiKeys: Partial<Record<AIProviderId, string>>;
  autoScroll: boolean;
  soundEffects: boolean;
  systemInstructionOverride?: string;
}
