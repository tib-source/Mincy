import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { storeSecret } from "@/utils/api/secrets";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	let next = searchParams.get("next") ?? "/";
	if (!next.startsWith("/")) next = "/";

	if (code) {
		const supabase = await createClient();
		const { data : { session }, error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
      		throw error;
    	}

		if (!session?.provider_token && !session?.provider_refresh_token){
			throw new Error('Authentication with GitHub Failed. No tokens captured')
		}

		// Store tokens encrypted via the secrets edge function
		if (session.provider_token) {
			await storeSecret("github_access_token", session.provider_token);
		}
		if (session.provider_refresh_token) {
			await storeSecret("github_refresh_token", session.provider_refresh_token);
		}

		const host =
			request.headers.get("x-forwarded-host") || request.headers.get("host");
		const protocol = request.headers.get("x-forwarded-proto") || "https";
		const redirectUrl = `${protocol}://${host}${next}`;

		return NextResponse.redirect(redirectUrl);
	}

	// Fallback for errors
	const host = request.headers.get("host");
	return NextResponse.redirect(`https://${host}/login`);
}
