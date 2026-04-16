"use client";

import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Divider,
	Group,
	Modal,
	type ModalProps,
	Paper,
	Stack,
	Switch,
	Text,
	TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EnvironmentVariable } from "@/src/client/workflow";
import { useUpdateEnvironment } from "@/src/hooks/workflows/useUpdateEnvironment";
import { useDeleteProject } from "@/src/hooks/projects/useDeleteProject";
import { notifications } from "@mantine/notifications";
import type { Tables } from "@mincy/shared";

interface ProjectSettingsModalProps extends ModalProps {
	projectId: string;
	workflow: Tables<"Workflow"> | undefined;
	projectName?: string;
}

export function ProjectSettingsModal({
	projectId,
	workflow,
	projectName,
	...modalProps
}: ProjectSettingsModalProps) {
	const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
	const [newKey, setNewKey] = useState("");
	const [newValue, setNewValue] = useState("");
	const [newIsSecret, setNewIsSecret] = useState(false);
	const { mutate: saveEnvironment, isPending } = useUpdateEnvironment(projectId);
	const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
	const router = useRouter();

	useEffect(() => {
		if (workflow?.environment && Array.isArray(workflow.environment)) {
			setVariables(workflow.environment as unknown as EnvironmentVariable[]);
		}
	}, [workflow?.environment]);

	const handleAdd = () => {
		const key = newKey.trim();
		if (!key || variables.some((v) => v.key === key)) {return;}
		setVariables((prev) => [...prev, { key, value: newValue, secret: newIsSecret }]);
		setNewKey("");
		setNewValue("");
		setNewIsSecret(false);
	};

	return (
		<Modal {...modalProps} size="lg">
			<Stack gap="md">
				<Card>
					<Stack gap="md">
						<Group gap="sm">
							<Text fw={500}>Environment Variables</Text>
						</Group>

						<Divider />

						<Stack gap={2}>
							<Text size="xs" c="dimmed">
								Available to your pipeline.
							</Text>
						</Stack>

						{variables.map((v) => (
							<Paper withBorder key={v.key}>
								<Group gap="sm" align="center" wrap="nowrap" p="md">
									<Text flex={1} size="sm" fw={500} >{v.key}</Text>
									<Text flex={1} size="sm" c="dimmed">
										{v.secret ? "••••••••" : v.value}
									</Text>
									{v.secret && <Badge size="xs" variant="light" color="red">secret</Badge>}
									<ActionIcon variant="subtle" color="red" size="sm" onClick={() =>
										setVariables((prev) => prev.filter((item) => item.key !== v.key))
									}>
										<IconTrash size={14} />
									</ActionIcon>
								</Group>
							</Paper>
						))}

						<Group gap="xs" wrap="nowrap" align="end">
							<TextInput placeholder="KEY" value={newKey} onChange={(e) => setNewKey(e.currentTarget.value)} style={{ flex: 1 }} />
							<TextInput placeholder="value" value={newValue} onChange={(e) => setNewValue(e.currentTarget.value)} style={{ flex: 1 }} />
							<Switch label="Secret" checked={newIsSecret} onChange={(e) => setNewIsSecret(e.currentTarget.checked)} />
							<ActionIcon variant="light" onClick={handleAdd} disabled={!newKey.trim()}>
								<IconPlus size={16} />
							</ActionIcon>
						</Group>

						<Group justify="flex-end">
							<Button loading={isPending} onClick={() =>
								saveEnvironment(variables, { onSuccess: () => modalProps.onClose() })
							}>
								Save
							</Button>
						</Group>
					</Stack>
				</Card>

				<Card>
					<Stack gap="md">
						<Group gap="sm">
							<Text fw={500} c="red">Danger Zone</Text>
						</Group>

						<Divider />

						<Group justify="space-between">
							<Stack gap={2}>
								<Text size="sm">Delete this project</Text>
								<Text size="xs" c="dimmed">
									This action cannot be undone. All runs and workflows will be removed.
								</Text>
							</Stack>

							<Button
								color="red"
								variant="light"
								loading={isDeleting}
								onClick={() =>
									deleteProject(projectId, { onSuccess: () => {
										notifications.show({ title: `Project deleted`, message: `${projectName || "Project"} has been deleted`, color: "green" });
										router.push("/projects");
									} , onError: (error) => notifications.show({ message: error.message, color: "red" }) })
								}
							>
								Delete Project
							</Button>
						</Group>
					</Stack>
				</Card>
			</Stack>
		</Modal>
	);
}
