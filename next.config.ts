import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* Por si jode con la cache: 
   webpack: (config) => {
    config.cache = {
      type: "filesystem",
      compression: "gzip", // Comprime los archivos de caché
      cacheDirectory: ".next/cache/webpack", // Ubicación de la caché
    };
    return config;
  },
  */
};

export default nextConfig;
