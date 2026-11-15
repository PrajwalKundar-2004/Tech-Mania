import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Read ADMIN_LINK directly from server/.env
  let adminLink = '/mca-admin-team';
  try {
    const serverEnvPath = path.resolve(process.cwd(), '../server/.env');
    if (fs.existsSync(serverEnvPath)) {
      const content = fs.readFileSync(serverEnvPath, 'utf-8');
      const match = content.match(/^\s*(?:ADMIN_LINK|ADMIN_ROUTE|ADMIN_PATH)\s*=\s*(.+)$/m);
      if (match && match[1]) {
        adminLink = match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  } catch (err) {
    console.error('[vite.config] Could not read server .env:', err);
  }

  // Also check client env
  const clientEnv = loadEnv(mode, process.cwd(), '');
  if (clientEnv.VITE_ADMIN_LINK || clientEnv.ADMIN_LINK) {
    adminLink = clientEnv.VITE_ADMIN_LINK || clientEnv.ADMIN_LINK;
  }

  // Normalize path
  let cleanRoute = adminLink.trim();
  if (cleanRoute.startsWith('http://') || cleanRoute.startsWith('https://')) {
    try {
      cleanRoute = new URL(cleanRoute).pathname;
    } catch (_) {}
  }
  if (!cleanRoute.startsWith('/')) {
    cleanRoute = '/' + cleanRoute;
  }
  cleanRoute = cleanRoute.replace(/\/+$/, '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'watch-server-env',
        configureServer(server) {
          const serverEnvFile = path.resolve(process.cwd(), '../server/.env');
          server.watcher.add(serverEnvFile);
          server.watcher.on('change', (changedPath) => {
            if (path.resolve(changedPath) === serverEnvFile) {
              console.log('[vite] server/.env changed, reloading page...');
              server.ws.send({ type: 'full-reload' });
            }
          });
        },
      },
    ],
    define: {
      '__ADMIN_ROUTE__': JSON.stringify(cleanRoute),
      '__ADMIN_RAW_LINK__': JSON.stringify(adminLink),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
