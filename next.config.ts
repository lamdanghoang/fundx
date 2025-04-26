import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/seed/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "aggregator.testnet.walrus.atalma.io",
        port: "",
        pathname: "/v1/blobs/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
