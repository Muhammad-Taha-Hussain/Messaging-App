/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // env: {
  //   NEXT_PUBLIC_ZEGO_APP_ID: 1852444584,
  //   NEXT_PUBLIC_ZEGO_SERVER_ID: 'cb969a8a8468642bab7e4da4abdf9fcf',
  // },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      bufferutil: false,
      'utf-8-validate': false,
      encoding: false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'localhost',
      'messaging-app-gzy5.onrender.com',
      'pub-47957730b6ee4203842f8c68fae951a1.r2.dev',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
    ],
  },
};

module.exports = nextConfig;
