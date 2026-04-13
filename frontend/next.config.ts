import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Quitamos output: 'export' para habilitar el servidor de Vercel (SSR/ISR y Rutas Dinamicas)
  images: {
    unoptimized: true,
  },
  // Desactivamos el linting en build para acelerar el despliegue
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
