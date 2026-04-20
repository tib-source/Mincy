import {
	Box,
	type MantineColorScheme,
	useMantineColorScheme,
} from "@mantine/core";
import {
	Background,
	BackgroundVariant,
	type ColorMode,
	Controls,
	type Edge,
	ReactFlow,
	useReactFlow,
} from "@xyflow/react";
import {
	type DragEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { nodeRegistry } from "@/src/nodes/registry";
import {
	type AppNode,
	type DesignerState,
	useDesignerStore,
} from "@/src/store/store";
import { useDnD } from "@/src/context/DnDContext";
import { nanoid } from "nanoid";
import { useWorkflow } from "@/src/hooks/workflows/useWorkflows";
import { useParams } from "next/navigation";
import { PipelineSchema } from "@/src/client/workflow";

function getFlowTheme(theme: MantineColorScheme): ColorMode {
	switch (theme) {
		case "dark":
			return "dark";
		case "light":
			return "light";
		default:
			return "system";
	}
}

interface FlowCanvasProps {
	readOnly?: boolean;
}

export function FlowCanvas({ readOnly = false }: FlowCanvasProps) {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		setNodes,
		setEdges,
	} = useDesignerStore();
	const [mounted, setMounted] = useState(false);
	const { type } = useDnD();

	const colorScheme = useMantineColorScheme();
	const flowTheme: ColorMode = getFlowTheme(colorScheme.colorScheme);
	const { screenToFlowPosition } = useReactFlow();

	const projectId = useParams<{ project_id: string }>().project_id;
	const { data: workflow } = useWorkflow(projectId);

	useEffect(() => {
		if (!workflow) {
			return;
		}

		const { nodes, edges } = PipelineSchema.parse(workflow?.pipeline);
		setNodes(nodes);
		setEdges(edges);
	}, [workflow, setNodes, setEdges]);

	useEffect(() => {
		setMounted(true);
	}, []);

	const onDragOver = useCallback((event: DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: DragEvent) => {
			event.preventDefault();
			if (!type) {
				return;
			}

			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			const stageNode = nodes.find((n) => {
				if (n.type !== "stage") {
					return false;
				}
				const w = n.measured?.width ?? n.width ?? 280;
				const h = n.measured?.height ?? n.height ?? 160;
				return (
					position.x >= n.position.x &&
					position.x <= n.position.x + w &&
					position.y >= n.position.y &&
					position.y <= n.position.y + h
				);
			});

			const newNode: AppNode = {
				id: nanoid(10),
				type,
				position: stageNode
					? {
							x: position.x - stageNode.position.x,
							y: position.y - stageNode.position.y,
						}
					: position,
				data: { label: `${type} node` },
				...(type === "stage" && { style: { width: 400, height: 400 } }),
				...(type === "ScriptNode" && { style: { width: 350, height: 250 } }),
				...(stageNode && { parentId: stageNode.id, extent: "parent" as const }),
			};

			setNodes(nodes.concat(newNode));
		},
		[screenToFlowPosition, type, nodes, setNodes],
	);

	if (!mounted) {
		return null;
	}

	const nodeTypes = Object.fromEntries(
		nodeRegistry.map((node) => [node.type, node.component]),
	);

	return (
		<Box flex={1} h="100%" pos="relative">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={readOnly ? undefined : onNodesChange}
				onEdgesChange={readOnly ? undefined : onEdgesChange}
				onConnect={readOnly ? undefined : onConnect}
				nodeTypes={nodeTypes}
				colorMode={flowTheme}
				onDrop={readOnly ? undefined : onDrop}
				onDragOver={readOnly ? undefined : onDragOver}
				nodesDraggable={!readOnly}
				nodesConnectable={!readOnly}
				elementsSelectable={!readOnly}
				panOnDrag
				zoomOnScroll
				defaultViewport={{
					zoom: 0.75,
					x: 400,
					y: 200,
				}}
			>
				<Background
					style={{ backgroundColor: "var(--mantine-color-body)" }}
					variant={BackgroundVariant.Dots}
				/>
				<Controls showInteractive={!readOnly} />
			</ReactFlow>
		</Box>
	);
}
