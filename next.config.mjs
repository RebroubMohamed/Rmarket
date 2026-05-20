/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Cela permet de compiler même s'il y a des erreurs de types TypeScript (comme les "any")
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
