/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/opportunities', destination: '/radar', permanent: false },
      { source: '/opportunities/:path*', destination: '/radar', permanent: false },
      { source: '/agents', destination: '/radar', permanent: false },
      { source: '/agents/:path*', destination: '/radar', permanent: false },
      { source: '/about', destination: '/radar', permanent: false },
      { source: '/scoreboard', destination: '/radar', permanent: false },
      { source: '/monitor', destination: '/radar', permanent: false },
    ]
  },
}

module.exports = nextConfig


