/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Help shared hosting (e.g. Hostinger): avoid stale HTML after deploy so chunk URLs stay valid
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, must-revalidate' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
