"use client";

import {
	Badge,
	Card,
	Center,
	Code,
	Collapse,
	Group,
	Loader,
	Pagination,
	Stack,
	Text,
} from "@mantine/core";
import { useState } from "react";
import { useAuditLog } from "@/src/hooks/useAuditLog";
import type { AuditLogEntry } from "@/src/client/audit";
import { timeAgo } from "@/utils/api/helpers";

const ACTION_COLORS: Record<string, string> = {
	INSERT: "green",
	UPDATE: "blue",
	DELETE: "red",
};

const ACTION_LABELS: Record<string, string> = {
	INSERT: "Created",
	UPDATE: "Updated",
	DELETE: "Deleted",
};

const TABLE_LABELS: Record<string, string> = {
	Projects: "Project",
	Workflow: "Workflow",
	PipelineRun: "Pipeline Run",
};

function formatFull(iso: string): string {
	return new Date(iso).toLocaleString();
}

function getDescription(entry: AuditLogEntry) {
	const table = TABLE_LABELS[entry.table_name] || entry.table_name;
	const name =
		(entry.new_data?.name as string) ||
		(entry.old_data?.name as string) ||
		"";
	return { table, name };
}

function ChangedFields({ entry }: { entry: AuditLogEntry }) {
	if (entry.action !== "UPDATE" || !entry.old_data || !entry.new_data) {return null;}

	const changed = Object.keys(entry.new_data).filter(
		(k) => JSON.stringify(entry.old_data?.[k]) !== JSON.stringify(entry.new_data?.[k]),
	);

	if (changed.length === 0) {return null;}

	return (
		<Stack gap={4}>
			<Text size="xs" fw={500}>Changed fields</Text>
			{changed.map((field) => (
				<Group key={field} gap="xs" wrap="nowrap">
					<Badge size="xs" variant="outline" color="gray">{field}</Badge>
				</Group>
			))}
		</Stack>
	);
}

export function AuditCard() {
	const [page, setPage] = useState(0);
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const { data, isLoading } = useAuditLog(page);

	if (isLoading) {
		return (
			<Center py="xl">
				<Loader size="sm" type="dots" />
			</Center>
		);
	}

	if (!data || data.entries.length === 0) {
		return (
			<Card>
				<Text size="sm" c="dimmed" ta="center" py="lg">
					No activity yet.
				</Text>
			</Card>
		);
	}

	const totalPages = Math.ceil(data.total / 20);

	return (
		<Stack gap="sm">
			{data.entries.map((entry) => {
				const { table, name } = getDescription(entry);
				const label = ACTION_LABELS[entry.action] || entry.action;
				const isOpen = expandedId === entry.id;

				return (
					<Card
						key={entry.id}
						padding="md"
						style={{ cursor: "pointer" }}
						onClick={() => setExpandedId(isOpen ? null : entry.id)}
					>
						<Group justify="space-between" wrap="nowrap">
							<Group gap="sm" wrap="nowrap">
								<Badge
									size="sm"
									variant="light"
									color={ACTION_COLORS[entry.action] || "gray"}
									w={70}
								>
									{label}
								</Badge>
								<Stack gap={0}>
									<Text size="sm" fw={500}>{table}</Text>
									{name && (
										<Text size="xs" c="dimmed" lineClamp={1}>{name}</Text>
									)}
								</Stack>
							</Group>
							<Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
								{timeAgo(entry.created_at)}
							</Text>
						</Group>

						<Collapse in={isOpen}>
							<Stack gap="xs" mt="md" pl={78}>
								<Group gap="lg">
									<Stack gap={2}>
										<Text size="xs" c="dimmed">Who</Text>
										<Text size="sm">{entry.login || "system"}</Text>
									</Stack>
									<Stack gap={2}>
										<Text size="xs" c="dimmed">When</Text>
										<Text size="sm">{formatFull(entry.created_at)}</Text>
									</Stack>
									<Stack gap={2}>
										<Text size="xs" c="dimmed">Record ID</Text>
										<Code>{entry.record_id || "—"}</Code>
									</Stack>
								</Group>

								<ChangedFields entry={entry} />
							</Stack>
						</Collapse>
					</Card>
				);
			})}

			{totalPages > 1 && (
				<Center mt="sm">
					<Pagination
						total={totalPages}
						value={page + 1}
						onChange={(p) => setPage(p - 1)}
					/>
				</Center>
			)}
		</Stack>
	);
}
