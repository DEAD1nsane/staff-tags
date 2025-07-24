import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import fs from "fs";

const manifest = JSON.parse(await readFile("./manifest.json", "utf8"));
const outPath = "./dist/index.js";

const bundle = await rollup({
    input: "./src/index.ts",
    plugins: [esbuild()],
    external: ["react", "@vendetta/*"]
});

await bundle.write({
    file: outPath,
    format: "iife",
    name: "plugin", // 👈 this ensures a global is created
    exports: "default",
    globals(id) {
        if (id.startsWith("@vendetta")) return id.substring(1).replace(/\//g, ".");
        if (id === "react") return "window.React";
        return null;
    },
    compact: true,
    banner: "(() => {",
    footer: "})();"
});

// Update hash in manifest
const code = await readFile(outPath, "utf8");
manifest.hash = createHash("sha256").update(code).digest("hex");
await writeFile("./dist/manifest.json", JSON.stringify(manifest, null, 4));
fs.writeFileSync("dist/_redirects", "/ /index.js 200\n");

console.log("✅ Build complete with hash:", manifest.hash);