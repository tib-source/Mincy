import { TOML } from "bun";
import { logger } from "..";

export async function loadTomlConfig(path: string): Promise<object> {
	const file_content = await Bun.file(path).text();
	return TOML.parse(file_content);
}

export async function retry<T>(fn: () => Promise<T>, retries = 5, delayMs = 3000): Promise<T> {
	let attempt = 0;
	while (true) {
		try {
			return await fn();
		} catch (error) {
			attempt++;
			if (retries > 0 && attempt >= retries) throw error;
			logger.warn({ attempt, error: String(error) }, "Retrying...");
			await Bun.sleep(delayMs);
		}
	}
}
