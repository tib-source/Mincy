import { createClient } from "@/utils/supabase/client";

export interface AuditLogEntry {
	id: string;
	user_id: string | null;
	action: string;
	table_name: string;
	record_id: string | null;
	old_data: Record<string, unknown> | null;
	new_data: Record<string, unknown> | null;
	created_at: string;
	login: string | null;
}

export interface AuditPage {
	entries: AuditLogEntry[];
	total: number;
}

const PAGE_SIZE = 20;

export async function getAuditLog(page: number): Promise<AuditPage> {
	const supabase = createClient();
	const from = page * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;

	const { data, error, count } = await supabase
		.from("audit_log")
		.select("*", { count: "exact" })
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		throw new Error(error.message);
	}
	consoe.log("Fetched audit log entries:", data);
	const entries = (data || []) as unknown as Omit<AuditLogEntry, "login">[];

	// Resolve logins separately — no FK to profile
	const userIds = Array.from(new Set(entries.map((e) => e.user_id).filter(Boolean))) as string[];
	const loginMap = new Map<string, string>();

	if (userIds.length > 0) {
		const { data: profiles } = await supabase
			.from("profile")
			.select("id, login")
			.in("id", userIds);

		if (profiles) {
			for (const p of profiles) {
				loginMap.set(p.id, p.login);
			}
		}
	}

	return {
		entries: entries.map((e) => ({
			...e,
			login: e.user_id ? loginMap.get(e.user_id) || null : null,
		})),
		total: count || 0,
	};
}
