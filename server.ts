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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// API route for streaming AI chat completions
app.post('/api/chat', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.trim()) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required before using Axiom AI.' });
    }

    const payload = req.body;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    await handleStreamChatResponse(payload, (chunkText) => {
      res.write(chunkText);
    });

    res.end();
  } catch (err: any) {
    console.error('Server API Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal AI Service Error' });
    } else {
      res.write(`\n\n[Error: ${err.message || 'Stream interrupted'}]`);
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
