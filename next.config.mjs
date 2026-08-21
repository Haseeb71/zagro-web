/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Package Express backend into every Amplify SSR/API Lambda
  outputFileTracingIncludes: {
    '/api/**/*': ['./server/**/*'],
    '/api/[[...path]]': [
      './server/**/*',
      './server/app.js',
      './server/src/**/*',
      './node_modules/mongoose/**/*',
      './node_modules/express/**/*',
      './node_modules/bcryptjs/**/*',
    ],
    '/api/health': [],
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
