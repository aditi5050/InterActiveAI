/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["gsap"],
  // output: "export", // Disabled for dynamic API routes
  // Actually, let's stick to standard build unless user asked for static.
  // User asked for "npm run dev without hydration errors".
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["orange-funicular-5gxqgqgw4rw7fv96w-3000.app.github.dev"],
    },
  },
  images: {
    unoptimized: true, // Necessary for local images unless we configure domains or loader
  },
};

export default nextConfig;
