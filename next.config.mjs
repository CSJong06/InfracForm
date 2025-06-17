/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PLAYLAB_API_KEY: process.env.PLAYLAB_API_KEY,
    PLAYLAB_PROJECT_ID: process.env.PLAYLAB_PROJECT_ID,
  },
};

export default nextConfig;
