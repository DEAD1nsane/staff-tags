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
	name: "plugin", // Exposes your plugin object as `plugin`
	exports: "default",
	globals(id) {
		if (id.startsWith("@vendetta"))
			return id.substring(1).replace(/\//g, ".");
		if (id === "react") return "window.React";
		return null;
	},
	compact: true,
	banner: "(() => {",
	footer: "return plugin; })();" // ✅ This makes Vendetta receive the plugin object
});

// ✅ No wrapping here anymore — just read the file directly
const code = await readFile(outPath, "utf8");

// Update manifest with SHA256 hash
const manifestPath = "./manifest.json";
const manifestRaw = await readFile(manifestPath, "utf8");
const manifest = JSON.parse(manifestRaw);

const hash = createHash("sha256").update(code).digest("hex");
manifest.hash = hash;

await writeFile(manifestPath, JSON.stringify(manifest, null, 4));

console.log("✅ Build complete. SHA256:", hash);