/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
  // UI is a source (JIT) package; transpile it. Built packages resolve directly.
  transpilePackages: ['@invincible/ui'],
  // Lint is enforced in CI via the root ESLint config; don't block builds on it.
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizePackageImports: ['lucide-react', '@invincible/ui'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
