/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  redirects: async () => {
    return [
      {
        source: "/signup",
        destination: "/handler/sign-up",
        permanent: true,
      },
      {
        source: "/sign-up",
        destination: "/handler/sign-up",
        permanent: true,
      },
      {
        source: "/login",
        permanent: true,
        destination: "/handler/sign-in"
      },
      {
        source: "/sign-in",
        destination: "/handler/sign-in",
        permanent: true,
      },
      {
        source: "/signout",
        destination: "/handler/sign-out",
        permanent: true,
      },
      {
        source: "/sign-out",
        destination: "/handler/sign-out",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
