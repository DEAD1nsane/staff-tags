import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import fs from "fs";

// Load and parse manifest.json (template)
const manifest = JSON.parse(await readFile("./manifest.json", "utf8"));

// Output folder for GitHub Pages
const outDir = "./docs";
const outPath = `${outDir}/index.js`;

// Bundle with Rollup + esbuild
const bundle = await rollup({
    input: "./src/index.ts",
    plugins: [esbuild()],
    external: ["react", "@vendetta/*"]
});

// Write CommonJS output (Vendetta-compatible)
await bundle.write({
    file: outPath,
    format: "cjs",
    exports: "named",
    compact: true
});

// Hash built file
const code = await readFile(outPath, "utf8");
manifest.hash = createHash("sha256").update(code).digest("hex");

// Write updated manifest.json into /docs
await writeFile(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 4));

// Optional: Add Netlify-style _redirects for fallback (not needed for GitHub Pages)
fs.writeFileSync(`${outDir}/_redirects`, "/ /index.js 200\n");

console.log("✅ Build complete with hash:", manifest.hash);