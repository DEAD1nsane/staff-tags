import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import fs from "fs";

// Load and parse manifest.json
const manifest = JSON.parse(await readFile("./manifest.json", "utf8"));

// Define build output path
const outPath = "./dist/index.js";

// Create bundle with ESBuild (TypeScript support)
const bundle = await rollup({
    input: "./src/index.ts",
    plugins: [esbuild()],
    external: ["react", "@vendetta/*"]
});

// Write bundle in CommonJS format (Vendetta expects this)
await bundle.write({
    file: outPath,
    format: "cjs", // ✅ Use CommonJS format
    exports: "named",
    compact: true
});

// Generate SHA-256 hash of built file
const code = await readFile(outPath, "utf8");
manifest.hash = createHash("sha256").update(code).digest("hex");

// Write updated manifest.json to /dist
await writeFile("./dist/manifest.json", JSON.stringify(manifest, null, 4));

// Optional: for Netlify-style redirects if you're deploying there
fs.writeFileSync("dist/_redirects", "/ /index.js 200\n");

console.log("✅ Build complete with hash:", manifest.hash);