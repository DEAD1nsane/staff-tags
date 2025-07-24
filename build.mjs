import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";

const bundle = await rollup({
	input: "./src/index.ts",
	plugins: [esbuild()],
	external: ["react", "@vendetta/*"]
});

const outPath = "./dist/index.js";

await bundle.write({
	file: outPath,
	format: "iife",
	name: "plugin", // ✅ this defines `var plugin = { ... }`
	exports: "default",
	globals(id) {
		if (id.startsWith("@vendetta"))
			return id.substring(1).replace(/\//g, ".");
		if (id === "react") return "window.React";
		return null;
	},
	compact: true,
	// ✅ This ensures Vendetta gets the actual plugin object
	banner: "(() => {",
	footer: "return plugin; })();"
});

// Read built code
const code = await readFile(outPath, "utf8");

// Read and update manifest
const manifestPath = "./manifest.json";
const manifestRaw = await readFile(manifestPath, "utf8");
const manifest = JSON.parse(manifestRaw);

// Generate and set hash
const hash = createHash("sha256").update(code).digest("hex");
manifest.hash = hash;

// Write updated manifest
await writeFile(manifestPath, JSON.stringify(manifest, null, 4));

console.log("✅ Build complete. SHA256:", hash);