import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const requestedPort = Number(process.env.PORT ?? 3000);
const PORT = Number.isFinite(requestedPort) ? requestedPort : 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

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
    console.log(`Srinath Portfolio running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
