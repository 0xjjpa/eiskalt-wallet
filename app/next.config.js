const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  })

  /** @type {import('next').NextConfig} */
  const path = require('path')

  const nextConfig = {
    reactStrictMode: true,
    webpack: config => {
      config.resolve.fallback = { fs: false };
      return config;
    },
    sassOptions: {
      includePaths: [path.join(__dirname, 'styles')],
    },
    experimental: {
      swcPlugins: [['@swc-jotai/react-refresh', {}]],
    }
  }

  module.exports = withPWA(nextConfig)
