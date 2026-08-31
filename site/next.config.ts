import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The registry YAML lives at the repository root, one level above site/.
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
