import { Select } from "@mantine/core";
import { IconTerminal } from "@tabler/icons-react";
import type { NodeProps } from "@xyflow/react";
import Editor from "@monaco-editor/react";
import { BaseNode } from "./Base/BaseNode";
import type { NodeDefinition } from "./registry";
import { useDesignerStore } from "../store/store";

const NODE_COLOR = "oklch(0.55 0.12 250)";

const DEFAULT_SCRIPT =
	'apt-get update && apt-get install -y cowsay\n/usr/games/cowsay "Hello from mincy!"';

export const SHELLS = ["bash", "sh", "zsh"] as const;
export type Shell = (typeof SHELLS)[number];
export const DEFAULT_SHELL: Shell = "bash";

const SHELL_OPTIONS = SHELLS.map((s) => ({ value: s, label: s }));

export const ScriptNodeDefinition: NodeDefinition = {
	type: "ScriptNode",
	label: "Command",
	icon: IconTerminal,
	component: ScriptNode,
	category: "Action",
	color: NODE_COLOR,
	description: "Run terminal commands",
};

export interface ScriptNodeConfig {
	script: string;
	shell: Shell;
}

function handleEditorWillMount(
	monaco: Parameters<
		NonNullable<React.ComponentProps<typeof Editor>["beforeMount"]>
	>[0],
) {
	monaco.editor.defineTheme("command-node", {
		base: "vs-dark",
		inherit: true,
		rules: [],
		colors: {
			"editor.background": "#2a2f35a2",
			"editor.foreground": "#d4d4d4",
			"editorCursor.foreground": "#aeafad",
			"editor.selectionBackground": "#264f78",
			"editor.lineHighlightBackground": "#1e1e1e",
		},
	});
}

export function ScriptNode({ id, selected, data }: NodeProps) {
	const { updateNodeData } = useDesignerStore();

	const config = data?.config as ScriptNodeConfig | undefined;
	const script = config?.script ?? DEFAULT_SCRIPT;
	const shell: Shell = config?.shell ?? DEFAULT_SHELL;

	const writeConfig = (next: Partial<ScriptNodeConfig>) => {
		updateNodeData(id, { config: { script, shell, ...next } });
	};

	const shellSelect = (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions
		<div
			className="nodrag nopan"
			onKeyDown={(e) => e.stopPropagation()}
			onPointerDown={(e) => e.stopPropagation()}
			style={{ marginLeft: 8 }}
		>
			<Select
				size="xs"
				w={80}
				data={SHELL_OPTIONS}
				value={shell}
				onChange={(v) => v && writeConfig({ shell: v as Shell })}
				allowDeselect={false}
				withCheckIcon={false}
				comboboxProps={{ withinPortal: true }}
			/>
		</div>
	);

	const details = (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions
		<div
			tabIndex={-1}
			className="nopan nodrag nowheel"
			onKeyDown={(e) => e.stopPropagation()}
			style={{ flex: 1, overflow: "hidden", minHeight: 0, borderRadius: 4 }}
		>
			<Editor
				height="100%"
				language="shell"
				theme="command-node"
				value={script}
				beforeMount={handleEditorWillMount}
				onChange={(v) => writeConfig({ script: v ?? "" })}
				options={{
					minimap: { enabled: false },
					lineNumbers: "off",
					scrollBeyondLastLine: false,
					fontSize: 13,
					padding: { top: 8, bottom: 8 },
					overviewRulerLanes: 0,
					scrollbar: { vertical: "hidden", horizontal: "auto" },
					renderLineHighlight: "none",
					folding: false,
					glyphMargin: false,
					lineDecorationsWidth: 12,
					lineNumbersMinChars: 0,
					wordWrap: "on",
				}}
			/>
		</div>
	);

	return (
		<BaseNode
			node={ScriptNodeDefinition}
			valid={!!script}
			details={details}
			headerRight={shellSelect}
			selected={selected}
			resizable
			minwidth={350}
			minHeight={200}
		/>
	);
}
