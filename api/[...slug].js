import app from '../server/index.js';

export default function handler(req, res) {
  // Vercel rewrites /api/(.*) -> /api/index.js
  // But Express routes are defined with the '/api' prefix (e.g., app.get('/api/health')).
  // Ensure the request URL maintains the /api prefix.
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url === '/' ? '' : req.url);
  }
  return app(req, res);
}
