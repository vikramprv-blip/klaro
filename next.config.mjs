/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/.next/**",
        "**/app_backup_min/**",
        "**/backup/**",
      ],
    }
    return config
  },
}

export default nextConfig
