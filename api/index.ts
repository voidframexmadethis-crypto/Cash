import { app } from '../server.js';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('Unhandled Vercel serverless function invocation error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err.message || 'Serverless function invocation failed',
        requestId: 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
      });
    }
  }
}

