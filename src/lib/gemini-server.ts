/**
 * ============================================================================
 * GEMINI API KEY & SERVICE CONFIGURATION
 * ============================================================================
 * To deploy or run this application with your own Google Gemini API key:
 * 1. Set GEMINI_API_KEY=YOUR_GEMINI_API_KEY in your .env or environment variables.
 * 2. You can obtain a free key at: https://aistudio.google.com/
 * ============================================================================
 */

import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Attachment } from '../types/chat';

// Ensure environment variables are loaded from .env.local and .env
try {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
} catch {
  // Ignore dotenv errors in serverless runtime
}

if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
  console.warn(
    '⚠️ [Axiom AI Warning]: GEMINI_API_KEY is not set in server environment variables. Please set GEMINI_API_KEY in your .env or server environment.'
  );
}

export interface ChatApiRequestPayload {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    attachments?: Attachment[];
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  customApiKey?: string;
  customApiKeys?: Record<string, string>;
}

const OPENROUTER_MODEL_MAP: Record<string, string> = {
  'gemini-3.6-flash': 'google/gemini-2.5-flash',
  'gemini-2.5-flash': 'google/gemini-2.5-flash',
  'gemini-2.5-pro': 'google/gemini-2.5-pro',
  'gemini-2.0-flash': 'google/gemini-2.0-flash-001',
  'gemini-1.5-flash': 'google/gemini-flash-1.5',
  'custom': 'google/gemini-2.5-flash',
};

export async function handleStreamChatResponse(
  payload: ChatApiRequestPayload,
  onChunk: (text: string) => void
): Promise<void> {
  const modelReq = payload.model || 'gemini-3.6-flash';
  const customKey = payload.customApiKey?.trim();
  const customKeys = payload.customApiKeys || {};

  const openrouterKey =
    (customKeys.openrouter && customKeys.openrouter.trim()) ||
    (customKey?.startsWith('sk-or-') ? customKey : undefined) ||
    process.env.OPENROUTER_API_KEY?.trim();

  // Retrieve Gemini API key from custom user key or process.env.GEMINI_API_KEY
  const geminiKey =
    (customKeys.gemini && customKeys.gemini.trim()) ||
    (customKey && !customKey.startsWith('sk-or-') ? customKey : undefined) ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();

  const isGeminiModel = modelReq.startsWith('gemini') || modelReq === 'custom';

  // 1. Prefer native Google Gemini SDK if Gemini key is available
  if (isGeminiModel && geminiKey) {
    try {
      await streamGeminiResponse(payload, geminiKey, modelReq, onChunk);
      return;
    } catch (err: any) {
      console.warn('Native Gemini SDK failed, trying OpenRouter fallback if available:', err?.message || err);
      if (!openrouterKey) throw err;
    }
  }

  // 2. If OpenRouter key exists, stream via OpenRouter
  if (openrouterKey) {
    const mappedModel = OPENROUTER_MODEL_MAP[modelReq] || (modelReq.includes('/') ? modelReq : 'google/gemini-2.5-flash');
    await streamOpenRouterResponse(payload, openrouterKey, mappedModel, onChunk);
    return;
  }

  // 3. Fallback to Gemini SDK if default key is present
  if (geminiKey) {
    await streamGeminiResponse(payload, geminiKey, 'gemini-3.6-flash', onChunk);
    return;
  }

  throw new Error(
    'Gemini API key is not configured. Please add GEMINI_API_KEY to your server environment variables or enter your API key in Settings -> API Keys Setup.'
  );
}

async function streamOpenRouterResponse(
  payload: ChatApiRequestPayload,
  apiKey: string,
  modelName: string,
  onChunk: (text: string) => void
): Promise<void> {
  const formattedMessages: any[] = [];

  if (payload.systemInstruction) {
    formattedMessages.push({
      role: 'system',
      content: payload.systemInstruction,
    });
  }

  for (const msg of payload.messages) {
    const role = msg.role === 'assistant' ? 'assistant' : msg.role;
    const images = msg.attachments?.filter((a) => a.base64Data && a.mimeType?.startsWith('image/')) || [];
    const textAttachments = msg.attachments?.filter((a) => a.content) || [];

    let textContent = msg.content || '';
    if (textAttachments.length > 0) {
      const attText = textAttachments
        .map((a) => `[Attached File: ${a.name}]\n${a.content}`)
        .join('\n\n');
      textContent = `${attText}\n\n${textContent}`;
    }

    if (images.length > 0) {
      const contentParts: any[] = [{ type: 'text', text: textContent || ' ' }];
      images.forEach((img) => {
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: `data:${img.mimeType};base64,${img.base64Data}`,
          },
        });
      });
      formattedMessages.push({ role, content: contentParts });
    } else {
      formattedMessages.push({ role, content: textContent || ' ' });
    }
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://axiom-ai.app',
      'X-Title': 'Axiom AI',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: formattedMessages,
      stream: true,
      temperature: payload.temperature ?? 0.7,
      max_tokens: payload.maxTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `OpenRouter API Error (${response.status})`;
    try {
      const errObj = JSON.parse(errorText);
      errorMsg = errObj.error?.message || errObj.message || errorText;
    } catch {
      errorMsg = errorText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  if (!response.body) {
    throw new Error('No stream body returned from OpenRouter API.');
  }

  const reader = (response.body as any).getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') continue;

      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            onChunk(delta);
          }
        } catch {
          // ignore partial JSON chunks
        }
      }
    }
  }
}

async function streamGeminiResponse(
  payload: ChatApiRequestPayload,
  apiKey: string,
  modelName: string,
  onChunk: (text: string) => void
): Promise<void> {
  const ai = new GoogleGenAI({ apiKey });

  // Clean model name if passed with 'models/' prefix
  let cleanModel = modelName.startsWith('models/') ? modelName.replace('models/', '') : modelName;

  if (
    cleanModel === 'AX Nova 1.0' ||
    cleanModel === 'custom' ||
    cleanModel === 'gemini-2.5-flash' ||
    cleanModel === 'gemini-2.0-flash' ||
    cleanModel === 'gemini-1.5-flash' ||
    cleanModel === 'gemini-2.5-pro' ||
    cleanModel === 'gemini-1.5-pro'
  ) {
    cleanModel = 'gemini-3.6-flash';
  }

  // Build model candidate sequence with valid Gemini API model identifiers
  const candidates = Array.from(
    new Set([
      cleanModel,
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-3.1-pro-preview',
    ])
  );

  // Extract any system messages into systemInstruction
  const systemMessagesText = payload.messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');

  let combinedSystemInstruction = payload.systemInstruction || '';
  if (systemMessagesText) {
    combinedSystemInstruction = combinedSystemInstruction
      ? `${combinedSystemInstruction}\n\n${systemMessagesText}`
      : systemMessagesText;
  }

  const chatMessages = payload.messages.filter((m) => m.role !== 'system');

  const contents = chatMessages.map((msg) => {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const parts: any[] = [];

    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach((att) => {
        if (att.base64Data && att.mimeType) {
          parts.push({
            inlineData: {
              data: att.base64Data,
              mimeType: att.mimeType,
            },
          });
        } else if (att.content) {
          parts.push({
            text: `[Attached File: ${att.name}]\n${att.content}\n`,
          });
        }
      });
    }

    parts.push({ text: msg.content || ' ' });

    return {
      role,
      parts,
    };
  });

  const config: any = {
    temperature: payload.temperature ?? 0.7,
    maxOutputTokens: payload.maxTokens ?? 4096,
  };
  if (combinedSystemInstruction) {
    config.systemInstruction = combinedSystemInstruction;
  }

  let lastErr: any = null;
  for (const modelCandidate of candidates) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelCandidate,
        contents,
        config,
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          onChunk(chunk.text);
        }
      }
      return;
    } catch (err: any) {
      console.warn(`Gemini model candidate '${modelCandidate}' failed:`, err?.message || err);
      lastErr = err;
    }
  }

  if (lastErr) {
    throw lastErr;
  }
}

