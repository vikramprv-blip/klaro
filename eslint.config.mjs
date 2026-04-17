import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals.js";

const nextConfigArray = Array.isArray(nextVitals)
  ? nextVitals
  : Array.isArray(nextVitals?.default)
    ? nextVitals.default
    : [nextVitals].filter(Boolean);

export default defineConfig([
  ...nextConfigArray,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
  ]),
]);
