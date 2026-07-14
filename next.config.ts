import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/portofolio',
        destination: 'https://portfolio-fayiz-pied.vercel.app/portofolio',
      },
      {
        source: '/portofolio/:path*',
        destination: 'https://portfolio-fayiz-pied.vercel.app/portofolio/:path*',
      },
    ];
  },
};

export default nextConfig;
