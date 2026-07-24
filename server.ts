/**
 * Axiom AI Server
 * ==============================================================================
 * To deploy or run this application with your own Google Gemini API key:
 * Set GEMINI_API_KEY=YOUR_GEMINI_API_KEY in your .env or environment variables.
 * Obtain your free API key at: https://aistudio.google.com/
 * ==============================================================================
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { handleStreamChatResponse, parseGeminiErrorMessage, getActiveApiKeys } from './src/lib/gemini-server';

try {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
} catch {
  // Ignore dotenv errors
}

if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
  console.warn(
    '⚠️ [Axiom AI Warning]: GEMINI_API_KEY is not configured in server environment variables. Please add GEMINI_API_KEY to your .env file or server environment.'
  );
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '20mb' }));

  // CORS middleware for API requests
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // API route for streaming AI chat completions
  app.post('/api/chat', async (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !payload.messages) {
        return res.status(400).json({ error: 'Missing required payload or messages array.' });
      }

      const { geminiKey, openrouterKey } = getActiveApiKeys(payload);
      if (!geminiKey && !openrouterKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY environment variable is missing. Please set GEMINI_API_KEY in your environment variables or provide an API key in settings.',
        });
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      await handleStreamChatResponse(payload, (chunkText) => {
        res.write(chunkText);
      });

      res.end();
    } catch (err: any) {
      console.error('Server API Error:', err);
      const errorMessage = parseGeminiErrorMessage(err);
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({ error: errorMessage });
      } else {
        res.write(`\n\n[Error: ${errorMessage}]`);
        res.end();
      }
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ Axiom AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
