import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    reactCompiler: true,
    staleTimes: {
      dynamic: 30,
    },
  },
  redirects: async () => {
    return [
      {
        destination: '/todo',
        permanent: true,
        source: '/',
      },
    ];
  },
};

module.exports = nextConfig;
