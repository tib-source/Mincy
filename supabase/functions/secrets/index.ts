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

async function getEncryptionKey(): Promise<CryptoKey> {
	const raw = Deno.env.get("SECRETS_ENCRYPTION_KEY");
	if (!raw) {
		throw new Error("SECRETS_ENCRYPTION_KEY is not set");
	}
	const keyBytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
	return crypto.subtle.importKey("raw", keyBytes, { name: ALGORITHM }, false, [
		"encrypt",
		"decrypt",
	]);
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
		encrypted: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
		iv: btoa(String.fromCharCode(...iv)),
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

function getServiceClient() {
	const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
	const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
	return createClient(supabaseUrl, serviceRoleKey);
}

async function getAuthenticatedUserId(req: Request): Promise<string> {
	const authHeader = req.headers.get("authorization");
	if (!authHeader) throw new Error("Missing authorization header");

	const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
	const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
	const userClient = createClient(supabaseUrl, anonKey, {
		global: { headers: { Authorization: authHeader } },
	});

	const {
		data: { user },
		error,
	} = await userClient.auth.getUser();
	if (error || !user) throw new Error("Unauthorized");
	return user.id;
}

// --- Handlers ---

async function handleStore(req: Request) {
	const userId = await getAuthenticatedUserId(req);
	const { name, value } = await req.json();

	if (!name || !value) {
		return jsonResponse({ error: "name and value are required" }, 400);
	}

	const { encrypted, iv } = await encrypt(value);
	const supabase = getServiceClient();

	const { error } = await supabase
		.from("secrets")
		.upsert(
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

async function handleGet(req: Request) {
	const userId = await getAuthenticatedUserId(req);
	const { name } = await req.json();

	if (!name) {
		return jsonResponse({ error: "name is required" }, 400);
	}

	const supabase = getServiceClient();
	const { data, error } = await supabase
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

async function handleDelete(req: Request) {
	const userId = await getAuthenticatedUserId(req);
	const { name } = await req.json();

	if (!name) {
		return jsonResponse({ error: "name is required" }, 400);
	}

	const supabase = getServiceClient();
	const { error } = await supabase
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
		const url = new URL(req.url);
		const action = url.searchParams.get("action");

		switch (action) {
			case "store":
				return await handleStore(req);
			case "get":
				return await handleGet(req);
			case "delete":
				return await handleDelete(req);
			default:
				return jsonResponse({ error: "Invalid action. Use: store, get, delete" }, 400);
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal server error";
		const status = message === "Unauthorized" ? 401 : 500;
		return jsonResponse({ error: message }, status);
	}
});
