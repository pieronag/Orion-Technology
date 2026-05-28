import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // <--- Añadimos esto
  images: {
    unoptimized: true, // <--- Obligatorio para exportación estática en Next.js
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
