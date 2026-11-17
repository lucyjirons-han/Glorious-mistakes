import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

// Lets the Learn articles in src/content/learn be written as Markdown (.mdx) files.
const withMDX = createMDX();

export default withMDX(nextConfig);
