import {
	Accordion,
	Badge,
	Box,
	Button,
	Flex,
	Stack,
	Switch,
	TagsInput,
	Text,
} from "@mantine/core";
import {
	IconCalendar,
	IconGitCommit,
	IconGitPullRequest,
	IconPlayerPlay,
	IconPlus,
	IconTag,
	IconWebhook,
} from "@tabler/icons-react";
import type { NodeProps } from "@xyflow/react";
import { useState } from "react";
import { useDesignerStore } from "../store/store";
import { BaseNode } from "./Base/BaseNode";
import type { NodeDefinition } from "./registry";

export const TriggerNodeDefinition: NodeDefinition = {
	type: "TriggerNode",
	label: "Trigger",
	icon: IconPlayerPlay,
	component: TriggerNode,
	category: "Source",
	color: "oklch(0.72 0.16 45)",
	description: "start your workflow",
};

export type TriggerType =
	| "manual"
	| "commit"
	| "schedule"
	| "webhook"
	| "tag"
	| "pull_request";

export interface BaseTriggerConfig {
	type: TriggerType;
	enabled: boolean;
}

export interface ManualTriggerConfig extends BaseTriggerConfig {
	type: "manual";
}

export interface ScheduledTriggerConfig extends BaseTriggerConfig {
	type: "schedule";
	cronSchedule: string;
}

export interface CommitTriggerConfig extends BaseTriggerConfig {
	type: "commit";
	branches: string[];
}

export type TriggerConfig =
	| ManualTriggerConfig
	| ScheduledTriggerConfig
	| CommitTriggerConfig;

interface TriggerOptions {
	type: TriggerType;
	label: string;
	icon: React.ReactNode;
	description: string;
}

const triggerOptions: TriggerOptions[] = [
	{
		type: "manual",
		label: "Manual",
		icon: <IconPlayerPlay size={10} />,
		description: "Trigger manually via UI or API",
	},
	{
		type: "commit",
		label: "On Push",
		icon: <IconGitCommit size={10} />,
		description: "When code is pushed to branch",
	},
	{
		type: "pull_request",
		label: "Pull Request",
		icon: <IconGitPullRequest size={10} />,
		description: "On PR open, update, or merge",
	},
	{
		type: "schedule",
		label: "Scheduled",
		icon: <IconCalendar size={10} />,
		description: "Run on a cron schedule",
	},
	{
		type: "webhook",
		label: "Webhook",
		icon: <IconWebhook size={15} />,
		description: "Trigger via external webhook",
	},
	{
		type: "tag",
		label: "On Tag",
		icon: <IconTag size={15} />,
		description: "When a tag is created",
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
	triggerInfo: TriggerOptions;
	updateTrigger: (trigger: T, updates: Partial<T>) => void;
}

export function CommitTriggerEditor({
	trigger,
	updateTrigger,
}: TriggerEditorProps<CommitTriggerConfig>) {
	const handleBranchRemove = (item: string) => {
		updateTrigger(trigger, {
			branches: trigger.branches.filter((branch) => branch !== item),
		});
	};

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
	const [enabledTiggers, setEnabledTriggers] = useState<TriggerOptions[]>([
		triggerOptions[0],
		triggerOptions[3],
	]);
	const { updateNodeData } = useDesignerStore();
	const config: Triggers = (data?.config as Triggers) ?? {
		triggers: [
			{ type: "manual", enabled: true },
			{ type: "commit", branches: ["main"] },
		],
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

	const details = (
		<Stack gap="sm">
			<Flex>
				{enabledTiggers.map((trigger) => (
					<Badge
						key={trigger.type}
						size="xs"
						variant="light"
						leftSection={trigger.icon}
					>
						{trigger.label}
					</Badge>
				))}
			</Flex>

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
													No editor implemented for {trigger}
												</Text>
											);
									}
								})()}
							</Accordion.Panel>
						</Accordion.Item>
					);
				})}
			</Accordion>

			<Button
				fullWidth
				variant="outline"
				size="compact-md"
				bdrs="sm"
				style={{
					borderStyle: "dashed",
					borderWidth: 1,
					fontSize: 12,
				}}
				justify="center"
				leftSection={<IconPlus size={15} />}
			>
				Add Trigger
			</Button>
		</Stack>
	);

	return (
		<BaseNode
			node={TriggerNodeDefinition}
			valid={false}
			details={details}
			hasInput={false}
			color={TriggerNodeDefinition.color}
			selected={selected}
			minwidth={300}
			maxWidth={300}
		/>
	);
}
