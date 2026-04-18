import fs from "node:fs";
import path from "node:path";

const NODES_DIR = path.resolve(import.meta.dir, "../nodes");
const OUTPUT = path.resolve(import.meta.dir, "../client/src/generated/node-manifests.json");

const entries = fs.readdirSync(NODES_DIR, { withFileTypes: true });
const manifests = entries
	.filter((e) => e.isDirectory())
	.map((e) => {
		const manifestPath = path.join(NODES_DIR, e.name, "manifest.json");
		if (!fs.existsSync(manifestPath)) return null;
		return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
	})
	.filter(Boolean);

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(manifests, null, 2));

console.log(`Generated ${manifests.length} manifest(s) → ${OUTPUT}`);
