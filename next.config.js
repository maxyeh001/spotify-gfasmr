/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // 👈 ADD THIS LINE

    remotePatterns: [
      // Supabase (keep if still used)
      {
        protocol: "https",
        hostname: "sgoagbkdlvjtieqnhnsv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },

      // Cloudflare R2 public bucket
      {
        protocol: "https",
        hostname: "pub-689d7a8bcb6847b2b08626c9ae4f3c5f.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
