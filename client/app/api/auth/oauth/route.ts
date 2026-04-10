import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { storeSecret } from "@/utils/api/secrets";
import { GITHUB_SECRET_NAMES } from "@/utils/api/secretNames";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	let next = searchParams.get("next") ?? "/";
	if (!next.startsWith("/")) next = "/";

	if (code) {
		const supabase = await createClient();
		const {
			data: { session },
			error,
		} = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
			throw error;
		}

		if (!session?.provider_token && !session?.provider_refresh_token) {
			throw new Error("Authentication with GitHub Failed. No tokens captured");
		}

		await Promise.all([
			session.provider_token
				? storeSecret(GITHUB_SECRET_NAMES.ACCESS_TOKEN, session.provider_token)
				: null,
			session.provider_refresh_token
				? storeSecret(
						GITHUB_SECRET_NAMES.REFRESH_TOKEN,
						session.provider_refresh_token,
					)
				: null,
		]).catch((err) => {
			console.error("Failed to store tokens in secrets:", err);
		});

		const host =
			request.headers.get("x-forwarded-host") || request.headers.get("host");
		const protocol = request.headers.get("x-forwarded-proto") || "https";
		const redirectUrl = `${protocol}://${host}${next}`;

		return NextResponse.redirect(redirectUrl);
	}

	const host = request.headers.get("host");
	return NextResponse.redirect(`https://${host}/login`);
}
