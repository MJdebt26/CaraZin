import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Storefront markup is injected as raw HTML (base64 images inline); no <Image> needed.
  reactStrictMode: true,
  // Pin the tracing root to this project (a stray lockfile in the home dir
  // otherwise confuses Next's workspace-root inference).
  outputFileTracingRoot: here,
};

export default nextConfig;
