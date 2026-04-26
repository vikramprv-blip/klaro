/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["voyageai"],
  turbopack: {
    resolveAlias: {
      'voyageai': 'voyageai/dist/cjs/index.js'
    }
  },
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  async redirects() {
    return [
      { source: '/ca', destination: '/in/ca', permanent: true },
      { source: '/lawyer', destination: '/in/lawyer', permanent: true },
      { source: '/india', destination: '/in', permanent: true },
    ];
  },
};

export default nextConfig;
