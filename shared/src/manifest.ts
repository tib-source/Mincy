import fs from "node:fs";
import path from "node:path";

export interface InputSchema {
	type: "string" | "number" | "boolean" | "select";
	required?: boolean;
	default?: string | number | boolean;
	secret?: boolean;
	options?: string[];
	description?: string;
}

export interface NodeManifest {
	type: string;
	label: string;
	category: string;
	color: string;
	description: string;
	icon: string;
	execution: {
		script: string;
		dependencies?: string[];
	};
	inputs: Record<string, InputSchema>;
	configMapping: Record<string, { env: string; secret?: boolean }>;
	resizable?: boolean;
	minWidth?: number;
}

export function loadManifests(nodesDir: string): NodeManifest[] {
	const entries = fs.readdirSync(nodesDir, { withFileTypes: true });
	return entries
		.filter((e: fs.Dirent) => e.isDirectory())
		.map((e: fs.Dirent) => {
			const manifestPath = path.join(nodesDir, e.name, "manifest.json");
			if (!fs.existsSync(manifestPath)) return null;
			return JSON.parse(
				fs.readFileSync(manifestPath, "utf-8"),
			) as NodeManifest;
		})
		.filter((m: NodeManifest | null): m is NodeManifest => m !== null);
}
