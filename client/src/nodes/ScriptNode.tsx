import { IconTerminal } from "@tabler/icons-react";
import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./Base/BaseNode";
import type { NodeDefinition } from "./registry";
import { useDesignerStore } from "../store/store";
import Editor from "@monaco-editor/react";

const NODE_COLOR = "oklch(0.55 0.12 250)";

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
	cmd: string[];
	workdir?: string;
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

	const config = (data?.config as ScriptNodeConfig) ?? {
		cmd: [
			"sh",
			"-c",
			'apt-get update && apt-get install -y cowsay\n/usr/games/cowsay "Hello from mincy!"',
		],
	};

	const updateConfig = (updates: Partial<ScriptNodeConfig>) => {
		updateNodeData(id, { config: { ...config, ...updates } });
	};

	const script = config.cmd[2] || "";

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
				onChange={(v) => updateConfig({ cmd: ["sh", "-c", v ?? ""] })}
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
			selected={selected}
			resizable
			minwidth={350}
			minHeight={200}
		/>
	);
}
