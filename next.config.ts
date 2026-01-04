import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'opxlxuiivszxzcmrdnyk.supabase.co', // Dominio de Supabase
        port: '',
        pathname: '/**', // Permitir cualquier ruta dentro de ese dominio
      },
    ],
  },
};

export default nextConfig;