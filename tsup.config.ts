import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: "dist",
  },
  {
    entry: ["bin/cli.ts"],
    format: ["cjs"],
    sourcemap: true,
    outDir: "dist",
    outExtension: () => ({ js: ".cjs" }),
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
