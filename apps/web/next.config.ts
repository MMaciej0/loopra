import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const GOOGLE_AUTH_PATHS = ['/auth/google', '/auth/google/callback'];

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];

    return GOOGLE_AUTH_PATHS.map((path) => ({
      source: path,
      destination: `${process.env.API_URL}${path}`,
    }));
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
