import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;

function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers":
			"authorization, x-client-info, apikey, content-type",
	};
}

function jsonResponse(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { ...corsHeaders(), "Content-Type": "application/json" },
	});
}

function toBase64(bytes: Uint8Array): string {
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

let cachedKey: CryptoKey | null = null;

async function getEncryptionKey(): Promise<CryptoKey> {
	if (cachedKey) return cachedKey;

	const raw = Deno.env.get("SECRETS_ENCRYPTION_KEY");
	if (!raw) {
		throw new Error("SECRETS_ENCRYPTION_KEY is not set");
	}
	const keyBytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
	cachedKey = await crypto.subtle.importKey(
		"raw",
		keyBytes,
		{ name: ALGORITHM },
		false,
		["encrypt", "decrypt"],
	);
	return cachedKey;
}

async function encrypt(
	plaintext: string,
): Promise<{ encrypted: string; iv: string }> {
	const key = await getEncryptionKey();
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
	const encoded = new TextEncoder().encode(plaintext);

	const ciphertext = await crypto.subtle.encrypt(
		{ name: ALGORITHM, iv },
		key,
		encoded,
	);

	return {
		encrypted: toBase64(new Uint8Array(ciphertext)),
		iv: toBase64(iv),
	};
}

async function decrypt(encrypted: string, iv: string): Promise<string> {
	const key = await getEncryptionKey();
	const cipherBytes = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
	const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

	const decrypted = await crypto.subtle.decrypt(
		{ name: ALGORITHM, iv: ivBytes },
		key,
		cipherBytes,
	);

	return new TextDecoder().decode(decrypted);
}

const serviceClient = createClient(
	Deno.env.get("SUPABASE_URL")!,
	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function getAuthenticatedUserId(req: Request): Promise<string> {
	const authHeader = req.headers.get("authorization");
	if (!authHeader) throw new Error("Unauthorized");

	const userClient = createClient(
		Deno.env.get("SUPABASE_URL")!,
		Deno.env.get("SUPABASE_ANON_KEY")!,
		{ global: { headers: { Authorization: authHeader } } },
	);

	const {
		data: { user },
		error,
	} = await userClient.auth.getUser();
	if (error || !user) throw new Error("Unauthorized");
	return user.id;
}

async function handleStore(
	userId: string,
	{ name, value }: { name: string; value: string },
) {
	if (!name || !value) {
		return jsonResponse({ error: "name and value are required" }, 400);
	}

	const { encrypted, iv } = await encrypt(value);

	const { error } = await serviceClient.from("secrets").upsert(
		{
			user_id: userId,
			name,
			encrypted_value: encrypted,
			iv,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: "user_id,name" },
	);

	if (error) {
		return jsonResponse({ error: error.message }, 500);
	}

	return jsonResponse({ success: true });
}

async function handleGet(userId: string, { name }: { name: string }) {
	if (!name) {
		return jsonResponse({ error: "name is required" }, 400);
	}

	const { data, error } = await serviceClient
		.from("secrets")
		.select("encrypted_value, iv")
		.eq("user_id", userId)
		.eq("name", name)
		.maybeSingle();

	if (error) {
		return jsonResponse({ error: error.message }, 500);
	}

	if (!data) {
		return jsonResponse({ error: "Secret not found" }, 404);
	}

	const decryptedValue = await decrypt(data.encrypted_value, data.iv);
	return jsonResponse({ value: decryptedValue });
}

async function handleDelete(userId: string, { name }: { name: string }) {
	if (!name) {
		return jsonResponse({ error: "name is required" }, 400);
	}

	const { error } = await serviceClient
		.from("secrets")
		.delete()
		.eq("user_id", userId)
		.eq("name", name);

	if (error) {
		return jsonResponse({ error: error.message }, 500);
	}

	return jsonResponse({ success: true });
}

Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders() });
	}

	try {
		const userId = await getAuthenticatedUserId(req);
		const body = await req.json();
		const { action, ...params } = body;

		switch (action) {
			case "store":
				return await handleStore(userId, params);
			case "get":
				return await handleGet(userId, params);
			case "delete":
				return await handleDelete(userId, params);
			default:
				return jsonResponse(
					{ error: "Invalid action. Use: store, get, delete" },
					400,
				);
		}
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Internal server error";
		const status = message === "Unauthorized" ? 401 : 500;
		return jsonResponse({ error: message }, status);
	}
});
