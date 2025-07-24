import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import manifest from "./manifest.json" assert { type: "json" };
import { createHash } from "crypto";
import fs from "fs";

const bundle = await rollup({
    input: "./src/index.ts",
    plugins: [esbuild()],
    external: ["react", "@vendetta/*"]
});

const outPath = "./dist/index.js";

await bundle.write({
    file: outPath,
    format: "iife",
    exports: "default", // ✅ critical
    globals(id) {
        if (id.startsWith("@vendetta"))
            return id.substring(1).replace(/\//g, ".");
        if (id === "react") return "window.React";
        return null;
    },
    compact: true
});

const code = fs.readFileSync(outPath, "utf8");
const hash = createHash("sha256").update(code).digest("hex");

manifest.hash = hash;
fs.writeFileSync("./manifest.json", JSON.stringify(manifest, null, 4));

console.log("✅ Build complete. SHA256:", hash);