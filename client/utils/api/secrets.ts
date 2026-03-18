import { createClient } from "../supabase/server";

/**
 * Generic secrets client that calls the secrets edge function.
 * Always runs server-side (uses the user's session token for auth).
 */
async function callSecretsFunction(
	action: "store" | "get" | "delete",
	body: Record<string, string>,
) {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error("Not authenticated");
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	const res = await fetch(
		`${supabaseUrl}/functions/v1/secrets?action=${action}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
			body: JSON.stringify(body),
		},
	);

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.error ?? "Secrets service error");
	}

	return data;
}

export async function storeSecret(name: string, value: string) {
	return callSecretsFunction("store", { name, value });
}

export async function getSecret(
	name: string,
): Promise<string | null> {
	try {
		const data = await callSecretsFunction("get", { name });
		return data.value;
	} catch (err) {
		if (err instanceof Error && err.message === "Secret not found") {
			return null;
		}
		throw err;
	}
}

export async function deleteSecret(name: string) {
	return callSecretsFunction("delete", { name });
}
