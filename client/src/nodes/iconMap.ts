import {
	IconGitCommit,
	IconTerminal,
	IconSend,
	IconCloudUpload,
	IconPackage,
	IconDatabase,
	IconBrandDocker,
	IconShield,
	IconPuzzle,
	IconDownload,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

const iconMap: Record<string, ComponentType<{ width?: number }>> = {
	"git-commit": IconGitCommit,
	terminal: IconTerminal,
	send: IconSend,
	"cloud-upload": IconCloudUpload,
	"download": IconDownload,
	package: IconPackage,
	database: IconDatabase,
	docker: IconBrandDocker,
	shield: IconShield,
};

export function resolveIcon(
	name: string,
): ComponentType<{ width?: number }> {
	return iconMap[name] ?? IconPuzzle;
}
