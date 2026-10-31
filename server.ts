import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Server-side Gemini Nano Banana 2 (gemini-3.1-flash-lite-image) professional photo editor route
  app.post('/api/nano-banana-edit', async (req, res) => {
    try {
      const { imageUrl, title, moodSpec } = req.body as {
        imageUrl?: string;
        title?: string;
        moodSpec?: string;
      };

      if (!imageUrl || typeof imageUrl !== 'string') {
        res.status(400).json({ error: 'Missing imageUrl parameter.' });
        return;
      }

      // Resolve local asset from /public if relative path
      let base64ImageData = '';
      let mimeType = 'image/jpeg';

      if (imageUrl.startsWith('data:')) {
        const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (!match) {
          res.status(400).json({ error: 'Invalid data URL.' });
          return;
        }
        mimeType = match[1];
        base64ImageData = match[2];
      } else if (imageUrl.startsWith('/assets/')) {
        const safeRel = imageUrl.replace(/^\/+/, '');
        const filePath = path.resolve(process.cwd(), 'public', safeRel);
        const buf = await fs.readFile(filePath);
        base64ImageData = buf.toString('base64');
      } else {
        res.status(400).json({ error: 'Unsupported imageUrl format.' });
        return;
      }

      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(503).json({
          error: 'API key not configured.',
          fallback: true,
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const editPrompt = `Professionally color-grade and retouch this portfolio photograph ("${
        title || 'Fine Art Frame'
      }", ${
        moodSpec || 'Editorial Photography'
      }) like a Leica & Hasselblad master darkroom print: balanced exposure, rich shadow detail, natural skin tones, crisp micro-contrast, and subtle golden-hour warmth while preserving the exact subject and composition.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64ImageData,
                mimeType,
              },
            },
            {
              text: editPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            imageSize: '1K',
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const outMime = part.inlineData.mimeType || 'image/png';
          res.json({
            dataUrl: `data:${outMime};base64,${part.inlineData.data}`,
            model: 'gemini-3.1-flash-lite-image',
          });
          return;
        }
      }

      res.status(502).json({
        error: 'No edited image returned by model.',
        fallback: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Nano Banana edit failed';
      res.status(429).json({
        error: message,
        fallback: true,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Srinath Portfolio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
