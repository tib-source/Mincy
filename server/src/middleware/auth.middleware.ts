import type { Database } from "@mincy/shared";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Context, MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import { getCookie, setCookie } from "hono/cookie";

declare module "hono" {
	interface ContextVariableMap {
		supabase: SupabaseClient;
	}
}

export const getSupabase = (c: Context) => {
	return c.get("supabase");
};

type SupabaseEnv = {
	SUPABASE_URL: string;
	SUPABASE_PUBLISHABLE_KEY: string;
};

export const supabaseMiddleware = (): MiddlewareHandler => {
	return async (c, next) => {
		const supabaseEnv = env<SupabaseEnv>(c);
		const supabaseUrl = supabaseEnv.SUPABASE_URL ?? process.env.SUPABASE_URL;
		const supabasePublishableKey =
			supabaseEnv.SUPABASE_PUBLISHABLE_KEY ??
			process.env.SUPABASE_PUBLISHABLE_KEY;

		if (!supabaseUrl) {
			throw new Error("SUPABASE_URL missing!");
		}

		if (!supabasePublishableKey) {
			throw new Error("SUPABASE_PUBLISHABLE_KEY missing!");
		}

		const supabase = createServerClient<Database>(
			supabaseUrl,
			supabasePublishableKey,
			{
				cookies: {
					getAll: () =>
						Object.entries(getCookie(c)).map(([name, value]) => ({
							name,
							value: String(value),
						})),

					setAll: (cookies) => {
						cookies.forEach(({ name, value, options }) => {
							setCookie(c, name, value, {
								...options,
								sameSite:
									options?.sameSite === true
										? "strict"
										: options?.sameSite || undefined,
							});
						});
					},
				},
			},
		);

		c.set("supabase", supabase);

		await next();
	};
};
