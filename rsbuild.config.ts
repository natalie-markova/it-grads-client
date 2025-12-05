import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';
import fs from 'fs';

// SSL configuration for local development
const sslPath = path.join(__dirname, '../../ssl');
const hasSslCerts = fs.existsSync(path.join(sslPath, 'cert.pem')) &&
                    fs.existsSync(path.join(sslPath, 'key.pem'));

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'IT Grads - Платформа для выпускников IT',
    favicon: './public/favicon.svg',
  },
  server: {
    https: hasSslCerts ? {
      key: fs.readFileSync(path.join(sslPath, 'key.pem')),
      cert: fs.readFileSync(path.join(sslPath, 'cert.pem'))
    } : false,
    host: 'localhost',
    port: 3000,
    strictPort: true,
  },
  source: {
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api'),
      'import.meta.env.VITE_DOMAIN': JSON.stringify(process.env.VITE_DOMAIN || 'itgrads.ru'),
    },
  },
});
