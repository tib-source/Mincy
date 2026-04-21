"use client";

import {
	ActionIcon,
	Card,
	Center,
	Group,
	Loader,
	Stack,
	Text,
	ThemeIcon,
	Tooltip,
} from "@mantine/core";
import { IconDownload, IconPackage } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
	type Artifact,
	getArtifactDownloadUrl,
} from "@/src/client/artifacts";
import { useRunArtifacts } from "@/src/hooks/artifacts/useArtifacts";
import { timeAgo } from "@/utils/api/helpers";
import { formatBytes } from "@/utils/helpers";

interface ArtifactListProps {
	runId: string;
}

async function download(artifact: Artifact) {
	try {
		const url = await getArtifactDownloadUrl(artifact.storage_key);
		window.open(url, "_blank", "noopener,noreferrer");
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		notifications.show({
			title: "Download failed",
			message,
			color: "red",
		});
	}
}

export function ArtifactList({ runId }: ArtifactListProps) {
	const { data: artifacts, isLoading, error } = useRunArtifacts(runId);

	if (isLoading) {
		return (
			<Center py="xl">
				<Loader size="sm" type="dots" />
			</Center>
		);
	}

	if (error) {
		return (
			<Text size="sm" c="red">
				Failed to load artifacts: {error.message}
			</Text>
		);
	}

	if (!artifacts || artifacts.length === 0) {
		return (
			<Stack align="center" py="xl" gap="sm">
				<ThemeIcon size={42} variant="light" color="gray" radius="xl">
					<IconPackage size={22} />
				</ThemeIcon>
				<Text c="dimmed" size="sm">
					No artifacts for this run.
				</Text>
			</Stack>
		);
	}

	return (
		<Stack gap="sm">
			{artifacts.map((artifact) => (
				<Card key={artifact.id} padding="md" withBorder radius="sm">
					<Group justify="space-between" wrap="nowrap">
						<Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
							<ThemeIcon
								size="lg"
								variant="light"
								color="yellow"
								radius="sm"
							>
								<IconPackage size={18} />
							</ThemeIcon>
							<Stack gap={2} style={{ minWidth: 0 }}>
								<Text size="sm" fw={500} truncate>
									{artifact.name}
								</Text>
								<Group gap="md" wrap="nowrap">
									<Text size="xs" c="dimmed">
										{formatBytes(artifact.size_bytes)}
									</Text>
									<Text size="xs" c="dimmed">
										{timeAgo(artifact.created_at)}
									</Text>
									{artifact.sha256 && (
										<Tooltip label={artifact.sha256} withArrow>
											<Text fz="xs" c="dimmed">
												{artifact.sha256.slice(0, 10)}
											</Text>
										</Tooltip>
									)}
								</Group>
							</Stack>
						</Group>
						<Tooltip label="Download" withArrow>
							<ActionIcon
								variant="subtle"
								size="lg"
								onClick={() => download(artifact)}
								aria-label={`Download ${artifact.name}`}
							>
								<IconDownload size={18} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Card>
			))}
		</Stack>
	);
}
