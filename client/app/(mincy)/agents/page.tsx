"use client";
import {
	ActionIcon,
	Badge,
	Button,
	Center,
	Code,
	Container,
	CopyButton,
	Group,
	Loader,
	Modal,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
	IconCheck,
	IconCopy,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useAgents, useCreateAgent, useDeleteAgent } from "@/src/hooks/agents/useAgents";
import { timeAgo } from "@/utils/api/helpers";
import { DataTable, type DataTableColumn } from "@/src/components/DataTable/DataTable";
import type { Tables } from "@mincy/shared";

function AgentStatusBadge({ status, lastHeartbeat }: { status: string | null; lastHeartbeat: string | null }) {
	const isHealthy = status === "active" && lastHeartbeat &&
		(Date.now() - new Date(lastHeartbeat).getTime()) < 30_000;

	if (isHealthy) {
		return <Badge color="green" variant="light">Healthy</Badge>;
	}
	if (status === "active") {
		return <Badge color="yellow" variant="light">Stale</Badge>;
	}
	if (status === "paused") {
		return <Badge color="orange" variant="light">Paused</Badge>;
	}
	return <Badge color="gray" variant="light">Offline</Badge>;
}

export default function AgentsPage() {
	const { data: agents, isLoading, error } = useAgents();
	const createAgent = useCreateAgent();
	const deleteAgent = useDeleteAgent();

	const [opened, { open, close }] = useDisclosure(false);
	const [name, setName] = useState("");
	const [generatedToken, setGeneratedToken] = useState<string | null>(null);

	if (error) {
		notifications.show({ message: error.message, color: "red" });
	}

	async function handleCreate() {
		if (!name.trim()) {return;}
		try {
			const result = await createAgent.mutateAsync(name.trim());
			setGeneratedToken(result.token);
			setName("");
		} catch (e: any) {
			notifications.show({ message: e.message, color: "red" });
		}
	}

	function handleClose() {
		setGeneratedToken(null);
		setName("");
		close();
	}

	function handleDelete(id: string) {
		deleteAgent.mutate(id, {
			onError: (e) => {
				notifications.show({ message: e.message, color: "red" });
			},
		});
	}

	const columns: DataTableColumn<Tables<"Agents">>[] = [
		{
			key: "name",
			label: "Name",
			width: 200,
			render: (agent) => <Text fw={500}>{agent.name || "Unnamed"}</Text>,
		},
		{
			key: "status",
			label: "Status",
			width: 120,
			render: (agent) => (
				<AgentStatusBadge status={agent.status} lastHeartbeat={agent.last_heartbeat} />
			),
		},
		{
			key: "type",
			label: "Type",
			width: 100,
			render: (agent) => <Text size="sm" c="dimmed">{agent.type || "docker"}</Text>,
		},
		{
			key: "capacity",
			label: "Capacity",
			width: 90,
			render: (agent) => <Text size="sm">{agent.capacity ?? "-"}</Text>,
		},
		{
			key: "created",
			label: "Created",
			width: 150,
			render: (agent) => (
				<Text size="sm" c="dimmed">{timeAgo(agent.created_at)}</Text>
			),
		},
		{
			key: "actions",
			label: "",
			width: 50,
			render: (agent) => (
				<ActionIcon
					variant="subtle"
					color="red"
					onClick={(e) => {
						e.stopPropagation();
						handleDelete(agent.id);
					}}
					loading={deleteAgent.isPending}
				>
					<IconTrash size={16} />
				</ActionIcon>
			),
		},
	];

	return (
		<Container fluid pl="xl" pr="xl" pt="lg">
			<Modal
				opened={opened}
				onClose={handleClose}
				title={generatedToken ? "Agent Token" : "Register New Agent"}
				centered
				size="lg"
			>
				{generatedToken ? (
					<Stack>
						<Text size="sm" c="dimmed">
							Copy this token now. It will not be shown again.
						</Text>
						<Code
							block
							style={{
								wordBreak: "break-all",
								whiteSpace: "pre-wrap",
								fontFamily: "var(--mantine-font-family)",
							}}
						>
							{generatedToken}
						</Code>
						<CopyButton value={generatedToken}>
							{({ copied, copy }) => (
								<Button
									color={copied ? "teal" : "gray"}
									variant="light"
									onClick={copy}
									leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
									fullWidth
								>
									{copied ? "Copied" : "Copy Token"}
								</Button>
							)}
						</CopyButton>
						<Button onClick={handleClose} mt="sm">
							Done
						</Button>
					</Stack>
				) : (
					<Stack>
						<TextInput
							label="Agent Name"
							placeholder="e.g. build-runner-1"
							value={name}
							onChange={(e) => setName(e.currentTarget.value)}
							onKeyDown={(e) => e.key === "Enter" && handleCreate()}
						/>
						<Button
							onClick={handleCreate}
							loading={createAgent.isPending}
							disabled={!name.trim()}
						>
							Generate Token
						</Button>
					</Stack>
				)}
			</Modal>

			<Group justify="space-between">
				<Stack gap="sm">
					<Title order={1}>Agents</Title>
					<Text>Register and monitor your pipeline execution agents.</Text>
				</Stack>
				<Button onClick={open} leftSection={<IconPlus size={16} />}>
					New Agent
				</Button>
			</Group>

			{isLoading && (
				<Center mt="xl">
					<Loader type="dots" />
				</Center>
			)}

			{agents && agents.length > 0 && (
				<div style={{ marginTop: "var(--mantine-spacing-md)" }}>
					<DataTable
						columns={columns}
						data={agents}
						getKey={(agent) => agent.id}
					/>
				</div>
			)}

			{agents?.length === 0 && (
				<Center mt="xl">
					<Stack align="center" gap="sm">
						<Text c="dimmed">No agents registered yet.</Text>
						<Button variant="light" onClick={open} leftSection={<IconPlus size={16} />}>
							Register your first agent
						</Button>
					</Stack>
				</Center>
			)}
		</Container>
	);
}
