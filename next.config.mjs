/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/**/*': ['./server/**/*'],
    '/api/[[...path]]': ['./server/**/*'],
  },
  serverExternalPackages: ['mongoose', 'bcryptjs', 'express', 'multer', 'mongodb-memory-server'],
  images: {
    unoptimized: true,
    domains: ['localhost', '127.0.0.1', 'images.unsplash.com'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
