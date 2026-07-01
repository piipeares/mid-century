import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Images in public/imgs/ are local — no remote patterns needed
    // We disable warning for dynamic dimensions since the gallery
    // reads them at runtime via the server component
  },
};

export default nextConfig;
