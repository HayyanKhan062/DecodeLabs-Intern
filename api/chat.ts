/**
 * Vercel Serverless Function API Route for Axiom AI Chat
 * ==============================================================================
 * This endpoint processes POST requests to /api/chat when deployed on Vercel.
 * It uses handleStreamChatResponse from src/lib/gemini-server to communicate with
 * Google Gemini SDK and stream chunks back to the client.
 * ==============================================================================
 */

import dotenv from 'dotenv';
try {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
} catch {
  // Ignore filesystem dotenv errors in serverless runtime
}

import { handleStreamChatResponse, parseGeminiErrorMessage, getActiveApiKeys } from '../src/lib/gemini-server';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight CORS OPTIONS check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        // ignore JSON parse error if already object
      }
    }

    if (!payload || !payload.messages) {
      return res.status(400).json({ error: 'Missing required payload or messages array.' });
    }

    const { geminiKey, openrouterKey } = getActiveApiKeys(payload);
    if (!geminiKey && !openrouterKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY environment variable is missing. Please configure GEMINI_API_KEY in your environment variables or provide an API key in settings.',
      });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    await handleStreamChatResponse(payload, (chunkText: string) => {
      res.write(chunkText);
    });

    return res.end();
  } catch (err: any) {
    console.error('Vercel API Route Error:', err);
    const errorMessage = parseGeminiErrorMessage(err);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: errorMessage });
    } else {
      res.write(`\n\n[Error: ${errorMessage}]`);
      return res.end();
    }
  }
}
