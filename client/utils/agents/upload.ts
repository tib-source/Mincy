import { createHash } from "node:crypto";

export interface UploadPayload {
	bytes: Uint8Array;
	contentType: string;
	sha256: string;
}

export async function readUpload(file: File): Promise<UploadPayload> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const sha256 = createHash("sha256").update(bytes).digest("hex");
	const contentType = file.type || "application/octet-stream";
	return { bytes, contentType, sha256 };
}
