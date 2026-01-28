import { TOML } from "bun";

export async function loadTomlConfig(path: string): Promise<object> {
	const file_content = await Bun.file(path).text();
	return TOML.parse(file_content);
}
