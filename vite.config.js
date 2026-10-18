import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-local-commerce-resources',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = decodeURIComponent(req.url.split('?')[0]);
          if (rawUrl.startsWith('/past-papers/') || rawUrl.startsWith('/notes/') || rawUrl.startsWith('/syllabuses/')) {
            let filePath = path.join(process.cwd(), rawUrl);

            // If file doesn't exist directly, check alternative master-guides (mg) folder
            if (!fs.existsSync(filePath)) {
              const parts = rawUrl.split('/').filter(Boolean);
              if (parts[0] === 'notes' && parts.length === 3 && parts[2].endsWith('.md')) {
                const sub = parts[1] === 'business-studies' ? 'bs' : (parts[1] === 'accounting' ? 'acc' : (parts[1] === 'economics' ? 'econ' : parts[1]));
                const altPath = path.join(process.cwd(), 'notes', sub, 'mg', parts[2]);
                if (fs.existsSync(altPath)) {
                  filePath = altPath;
                }
              }
            }

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              let mimeType = 'application/octet-stream';
              if (ext === '.pdf') mimeType = 'application/pdf';
              else if (ext === '.md') mimeType = 'text/markdown; charset=utf-8';
              else if (ext === '.json') mimeType = 'application/json; charset=utf-8';
              else if (ext === '.html') mimeType = 'text/html; charset=utf-8';
              else if (ext === '.png') mimeType = 'image/png';
              else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
              else if (ext === '.svg') mimeType = 'image/svg+xml';
              else if (ext === '.txt') mimeType = 'text/plain; charset=utf-8';

              res.setHeader('Content-Type', mimeType);
              return fs.createReadStream(filePath).pipe(res);
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
