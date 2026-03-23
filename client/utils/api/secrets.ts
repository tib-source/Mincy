import { createClient } from "../supabase/server";

async function callSecretsFunction(
	action: "store" | "get" | "delete",
	body: Record<string, string>,
) {
	const supabase = await createClient();

	const { data, error } = await supabase.functions.invoke("secrets", {
		body: { ...body, action },
	});

	if (error) {
		throw new Error(error.message ?? "Secrets service error");
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
