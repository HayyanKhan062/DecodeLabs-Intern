/**
 * Vercel Serverless Function API Route for Axiom AI Chat
 * ==============================================================================
 * This endpoint processes POST requests to /api/chat when deployed on Vercel.
 * It uses handleStreamChatResponse from src/lib/gemini-server to communicate with
 * Google Gemini SDK and stream chunks back to the client.
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { handleStreamChatResponse } from '../src/lib/gemini-server';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight CORS OPTIONS check
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security check: Require authentication
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.trim()) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required before using Axiom AI.' });
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

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    await handleStreamChatResponse(payload, (chunkText: string) => {
      res.write(chunkText);
    });

    res.end();
  } catch (err: any) {
    console.error('Vercel API Route Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message || 'Internal AI Service Error' });
    } else {
      res.write(`\n\n[Error: ${err?.message || 'Stream interrupted'}]`);
      res.end();
    }
  }
}
