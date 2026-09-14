import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint to dispatch to n8n directly from server (eliminates browser CORS & mixed-content blocks)
  app.post('/api/webhook/dispatch', async (req, res) => {
    try {
      const { webhookUrl, payload } = req.body;
      const targetUrl = webhookUrl || 'https://sudarshansoni.app.n8n.cloud/webhook-test/ab91394f-7565-412d-b82d-9100e545e83a';

      console.log(`[Webhook Proxy] Forwarding to target: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData: unknown = responseText;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // Keep as string
      }

      console.log(`[Webhook Proxy] n8n response: status=${response.status}, body=${responseText.slice(0, 300)}`);

      res.status(response.status).json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[Webhook Proxy Error]:', errorMessage);
      res.status(502).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Proxy endpoint to check booking status from n8n via GET
  app.get('/api/webhook/status', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      const bookingId = req.query.bookingId as string;

      if (!targetUrl || targetUrl === 'PASTE_N8N_STATUS_WEBHOOK_URL_HERE') {
        return res.status(400).json({
          success: false,
          error: 'Status webhook URL is not configured.',
        });
      }

      const separator = targetUrl.includes('?') ? '&' : '?';
      const finalUrl = `${targetUrl}${separator}bookingId=${encodeURIComponent(bookingId || '')}`;

      console.log(`[Status Proxy] Checking status at: ${finalUrl}`);

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });

      const responseText = await response.text();
      let responseData: unknown = responseText;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // Keep as string
      }

      console.log(`[Status Proxy] Response: status=${response.status}, body=${responseText.slice(0, 200)}`);

      res.status(response.status).json({
        success: response.ok,
        status: response.status,
        data: responseData,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[Status Proxy Error]:', errorMessage);
      res.status(502).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
