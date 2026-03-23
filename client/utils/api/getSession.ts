import { createClient } from "../supabase/server";

type GetSessionRequest =
	| { ok: false; error: string }
	| { ok: true; supabase: Awaited<ReturnType<typeof createClient>> };

export async function getSession(): Promise<GetSessionRequest> {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		return {
			ok: false,
			error: "Not authenticated",
		};
	}

	return {
		ok: true,
		supabase,
	};
}
