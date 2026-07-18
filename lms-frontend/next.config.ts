import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "path";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // @ts-ignore - NextConfig type might not be updated for top-level turbopack in this version
  turbopack: {
    root: path.join(__dirname, "../../"),
  },
  // Prevent Prisma from being bundled incorrectly on Vercel
  serverExternalPackages: ["@prisma/client", "prisma"],
  allowedDevOrigins: ["192.168.1.7:3000", "192.168.1.7", "localhost:3000"]
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});
export default withMDX(nextConfig);
