import app from '../server/index.js';

export default function handler(req, res) {
  // Vercel's catch-all routes strip the '/api' prefix from req.url.
  // Express routes are defined with the '/api' prefix (e.g., app.get('/api/health')).
  // We add the prefix back here so Express can match the routes correctly.
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url === '/' ? '' : req.url);
  }
  
  return app(req, res);
}
