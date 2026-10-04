import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
for (const source of ["legacy-src/main.tsx", "legacy-src/library.tsx", "legacy-src/library.css"]) {
  if (fs.statSync(source).size === 0) throw new Error(`Cannot build empty source: ${source}`);
}
fs.mkdirSync("dist", { recursive: true });
await build({
  entryPoints: ["legacy-src/main.tsx"],
  bundle: true,
  minify: true,
  outfile: "dist/app.js",
  platform: "browser",
  format: "esm",
  jsx: "automatic",
  alias: { "@": "./legacy-src" },
  legalComments: "eof",
});
execFileSync(
  process.execPath,
  [
    "node_modules/@tailwindcss/cli/dist/index.mjs",
    "-i",
    "legacy-src/library.css",
    "-o",
    "dist/style.css",
    "--minify",
  ],
  { stdio: "inherit" },
);
fs.copyFileSync("legacy-src/index.html", "dist/index.html");
console.log("Built Aceternity gallery");
