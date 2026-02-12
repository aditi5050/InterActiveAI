/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
          // Allow localhost and all GitHub Codespaces domains
          allowedOrigins: [
            "localhost:3000",
            "localhost",
          ],
        },
    },
    // Support running behind a proxy (GitHub Codespaces)
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
