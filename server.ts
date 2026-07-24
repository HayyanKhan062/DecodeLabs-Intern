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
import { handleStreamChatResponse } from './src/lib/gemini-server';

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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// API route for streaming AI chat completions
app.post('/api/chat', async (req, res) => {
  try {
    const payload = req.body;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    await handleStreamChatResponse(payload, (chunkText) => {
      res.write(chunkText);
    });

    res.end();
  } catch (err: any) {
    console.error('Server API Error:', err);
    const errorMessage = err?.message || 'Internal AI Service Error';
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(400).json({ error: errorMessage });
    } else {
      res.write(`\n\n[Error: ${errorMessage}]`);
      res.end();
    }
  }
});

// Serve static assets in production
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`⚡ Axiom AI Server listening on port ${PORT}`);
});
