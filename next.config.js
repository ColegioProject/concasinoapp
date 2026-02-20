/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // MetaMask SDK pulls in React Native storage — shim it for web
        '@react-native-async-storage/async-storage': path.resolve(
          __dirname, 'src/lib/async-storage-shim.js'
        ),
        // pino-pretty is a CLI dev tool, not needed in browser
        'pino-pretty': path.resolve(__dirname, 'src/lib/pino-pretty-shim.js'),
      }
    }
    return config
  },
}

module.exports = nextConfig
