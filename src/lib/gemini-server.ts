import { GoogleGenAI } from '@google/genai';
import { Attachment } from '../types/chat';

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
  'gemini-2.5-flash': 'google/gemini-2.5-flash',
  'custom': 'google/gemini-2.5-flash',
};

export async function handleStreamChatResponse(
  payload: ChatApiRequestPayload,
  onChunk: (text: string) => void
): Promise<void> {
  const modelReq = payload.model || 'gemini-2.5-flash';
  const customKey = payload.customApiKey;
  const customKeys = payload.customApiKeys || {};

  const openrouterKey =
    customKeys.openrouter ||
    (customKey?.startsWith('sk-or-') ? customKey : undefined) ||
    process.env.OPENROUTER_API_KEY;

  const geminiKey =
    customKeys.gemini ||
    (customKey?.startsWith('AIza') ? customKey : undefined) ||
    process.env.GEMINI_API_KEY;

  const isGeminiModel = modelReq.startsWith('gemini');

  // If Gemini model and Gemini key exists, prefer native Gemini SDK
  if (isGeminiModel && geminiKey) {
    try {
      await streamGeminiResponse(payload, geminiKey, modelReq, onChunk);
      return;
    } catch (err: any) {
      console.warn('Native Gemini SDK failed, trying OpenRouter fallback if available:', err.message);
      if (!openrouterKey) throw err;
    }
  }

  // If OpenRouter key exists, stream via OpenRouter
  if (openrouterKey) {
    const mappedModel = OPENROUTER_MODEL_MAP[modelReq] || modelReq;
    await streamOpenRouterResponse(payload, openrouterKey, mappedModel, onChunk);
    return;
  }

  // Fallback if only Gemini Key exists for other models
  if (geminiKey) {
    await streamGeminiResponse(payload, geminiKey, 'gemini-2.5-flash', onChunk);
    return;
  }

  throw new Error(
    'No valid API key found. Please configure OPENROUTER_API_KEY or GEMINI_API_KEY in environment variables or settings.'
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

  let actualModel = modelName;
  if (!actualModel.startsWith('gemini')) {
    actualModel = 'gemini-2.5-flash';
  }

  const contents = payload.messages.map((msg) => {
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
    systemInstruction: payload.systemInstruction || undefined,
    temperature: payload.temperature ?? 0.7,
    maxOutputTokens: payload.maxTokens ?? 4096,
  };

  const candidates = Array.from(
    new Set([actualModel, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'])
  );

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
