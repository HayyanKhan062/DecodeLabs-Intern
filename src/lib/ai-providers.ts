import { AIModel, AIProviderId } from '../types/chat';

export interface ProviderInfo {
  id: AIProviderId;
  name: string;
  icon: string;
  description: string;
  keyPlaceholder: string;
}

export const AI_PROVIDERS: ProviderInfo[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: 'Sparkles',
    description: 'Fast, multimodal, high precision models powered by Google AI',
    keyPlaceholder: 'AIzaSy...',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    icon: 'Bot',
    description: 'State of the art reasoning & creative generation by OpenAI',
    keyPlaceholder: 'sk-proj-...',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    icon: 'Brain',
    description: 'Highly nuanced, safe, articulate reasoning models',
    keyPlaceholder: 'sk-ant-api...',
  },
  {
    id: 'groq',
    name: 'Groq Llama',
    icon: 'Zap',
    description: 'Ultra-low latency inference engine powering open weights models',
    keyPlaceholder: 'gsk_...',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: 'Globe',
    description: 'Unified router accessing 100+ top open and closed source LLMs',
    keyPlaceholder: 'sk-or-v1-...',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'Cpu',
    description: 'Superior math, code & logical reasoning model architecture',
    keyPlaceholder: 'sk-...',
  },
];

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'AX Nova 1.0',
    provider: 'gemini',
    description: 'Axiom’s primary intelligence engine powered by Gemini 2.5 Flash',
    badge: 'Recommended',
    maxTokens: 8192,
    supportsVision: true,
    isDefault: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    provider: 'openrouter',
    description: 'Custom configurable AI model architecture',
    badge: 'Custom',
    maxTokens: 8192,
    supportsVision: true,
  },
];

export function getModelById(modelId: string): AIModel {
  return AVAILABLE_MODELS.find((m) => m.id === modelId) || AVAILABLE_MODELS[0];
}

export function getModelDisplayName(modelId?: string): string {
  if (!modelId) return 'AX Nova 1.0';
  if (modelId === 'gemini-2.5-flash' || modelId === 'gemini-2.5-pro' || modelId === 'AX Nova 1.0') {
    return 'AX Nova 1.0';
  }
  const found = AVAILABLE_MODELS.find((m) => m.id === modelId);
  if (found) return found.name;
  return modelId;
}
