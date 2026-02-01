import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	let next = searchParams.get("next") ?? "/";
	if (!next.startsWith("/")) next = "/";

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			const host =
				request.headers.get("x-forwarded-host") || request.headers.get("host");
			const protocol = request.headers.get("x-forwarded-proto") || "https";

			// Construct the absolute URL using the headers
			// In local dev, x-forwarded-host is usually null, so it falls back to 'host'
			const redirectUrl = `${protocol}://${host}${next}`;

			return NextResponse.redirect(redirectUrl);
		}
	}

	// Fallback for errors
	const host = request.headers.get("host");
	return NextResponse.redirect(`https://${host}/login`);
}
