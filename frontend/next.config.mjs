/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable double invocation for WebSockets/WebRTC connections
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
