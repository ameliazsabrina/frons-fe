/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
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
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default nextConfig;
