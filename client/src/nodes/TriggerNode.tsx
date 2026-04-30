import {
	Accordion,
	Box,
	Flex,
	Stack,
	Switch,
	TagsInput,
	Text,
} from "@mantine/core";
import {
	IconGitCommit,
	IconPlayerPlay,
} from "@tabler/icons-react";
import type { NodeProps } from "@xyflow/react";
import { useDesignerStore } from "../store/store";
import { BaseNode } from "./Base/BaseNode";
import type { NodeDefinition } from "./registry";
import type { CommitTriggerConfig, TriggerConfig } from "@mincy/shared";

export const TriggerNodeDefinition: NodeDefinition = {
	type: "TriggerNode",
	label: "Trigger",
	icon: IconPlayerPlay,
	component: TriggerNode,
	category: "Source",
	color: "oklch(0.72 0.16 45)",
	description: "start your workflow",
};

const triggerOptions: TriggerConfig[] = [
	{
		type: "manual",
		enabled: true,
		label: "Manual",
		icon: <IconPlayerPlay size={10} />,
		description: "Trigger manually via UI or API",
	},
	{
		type: "commit",
		label: "On Push",
		enabled: true,
		branches: ["*"],
		icon: <IconGitCommit size={10} />,
		description: "When code is pushed to branch",
	},
];

interface Triggers {
	triggers: TriggerConfig[];
}
export interface TriggerNodeData {
	config?: Triggers;
}

interface TriggerEditorProps<T> {
	trigger: T;
	triggerInfo: TriggerConfig;
	updateTrigger: (trigger: T, updates: Partial<T>) => void;
}

export function CommitTriggerEditor({
	trigger,
	updateTrigger,
}: TriggerEditorProps<CommitTriggerConfig>) {

	const handleBranchAdd = (branches: string[]) => {
		updateTrigger(trigger, {
			branches: [...branches],
		});
	};

	return (
		<Box>
			<TagsInput
				label="Branches"
				description="Branches whose commits should trigger this"
				placeholder="Enter branches..."
				value={trigger.branches}
				onChange={handleBranchAdd}
			/>
		</Box>
	);
}

export function TriggerNode({ id, selected, data }: NodeProps) {
	const { updateNodeData } = useDesignerStore();
	const config: Triggers = (data?.config as Triggers) ?? {
		triggers: triggerOptions,
	};

	const updateNode = (updates: Partial<TriggerNodeData>) => {
		updateNodeData(id, updates);
	};

	const updateTrigger = (
		trigger: TriggerConfig,
		updates: Partial<TriggerConfig>,
	) => {
		updateNode({
			config: {
				triggers: config.triggers.map((t) =>
					t.type === trigger.type ? ({ ...t, ...updates } as TriggerConfig) : t,
				),
			},
		});
	};

	const validTriggers = config.triggers.filter( t => t.enabled)
	const details = (
		<Stack gap="sm">
			<Accordion
				styles={() => ({
					control: {
						background: "var(--mantine-color-body)",
						borderRadius: "var(--mantine-radius-md",
						margin: 0,
						height: 40,
					},
					panel: {
						background: "var(--mantine-color-body)",
						borderRadius: "var(--mantine-radius-md",
					},
				})}
				multiple
				chevronPosition="left"
				variant="contained"
			>
				{config.triggers.map((trigger) => {
					const triggerInfo = triggerOptions.find(
						(t) => t.type === trigger.type,
					)!;

					return (
						<Accordion.Item key={trigger.type} value={trigger.type}>
							<Accordion.Control>
								<Flex
									justify="space-between"
									align="center"
									style={{ width: "100%" }}
								>
									<Text fw={500}>{triggerInfo.label}</Text>
									<Switch
										checked={trigger.enabled}
										onChange={() =>
											updateTrigger(trigger, { enabled: !trigger.enabled })
										}
									/>
								</Flex>
							</Accordion.Control>

							<Accordion.Panel>
								{(() => {
									switch (trigger.type) {
										case "commit":
											return (
												<CommitTriggerEditor
													trigger={trigger}
													updateTrigger={updateTrigger}
													triggerInfo={triggerInfo}
												/>
											);
										case "manual":
											return (
												<Text c="dimmed">Pipeline can be ran manually</Text>
											);
										case "schedule":
											return <Text>Scheduled trigger editor here</Text>;
										default:
											return (
												<Text c="dimmed">
													No editor implemented for {trigger.type}
												</Text>
											);
									}
								})()}
							</Accordion.Panel>
						</Accordion.Item>
					);
				})}
			</Accordion>
		</Stack>
	);

	return (
		<BaseNode
			node={TriggerNodeDefinition}
			valid={validTriggers.length > 0}
			details={details}
			hasInput={false}
			color={TriggerNodeDefinition.color}
			selected={selected}
			minwidth={300}
		/>
	);
}
