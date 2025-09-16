/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: 1852444584,
    NEXT_PUBLIC_ZEGO_SERVER_ID: 'cb969a8a8468642bab7e4da4abdf9fcf'
  },
  images: {
    domains: ["lh3.googleusercontent.com", "localhost"],
  },
};

module.exports = nextConfig;
