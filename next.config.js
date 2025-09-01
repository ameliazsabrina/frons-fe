/** @type {import('next').NextConfig} */
const nextConfig = {
  // Support for subdomains - handled by middleware instead
  skipTrailingSlashRedirect: true,
  
  // Disable caching during development
  ...(process.env.NODE_ENV === 'development' && {
    headers: async () => [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ],
  }),
  webpack: (config, { isServer, webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\/__tests__\//,
      })
    );

    // Handle Turnkey and other web3 modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Handle problematic modules
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        "@turnkey/http": "commonjs @turnkey/http",
        "@turnkey/solana": "commonjs @turnkey/solana",
        "@turnkey/viem": "commonjs @turnkey/viem",
      });
    }

    // Handle Solana dependencies
    config.externals["@solana/web3.js"] = "commonjs @solana/web3.js";
    config.externals["@solana/spl-token"] = "commonjs @solana/spl-token";

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
