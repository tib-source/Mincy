import {
	Box,
	type MantineColorScheme,
	useMantineColorScheme,
	useMantineTheme,
} from "@mantine/core";
import {
	Background,
	BackgroundVariant,
	type ColorMode,
	Controls,
	Edge,
	ReactFlow,
	useReactFlow,
} from "@xyflow/react";
import { type DragEvent, useCallback, useEffect, useState } from "react";
import { nodeRegistry } from "@/src/nodes/registry";
import { type AppNode, useDesignerStore } from "@/src/store/store";
import { useDnD } from "@/src/context/DnDContext";
import { nanoid } from "nanoid";
import { useWorkflow } from "@/src/hooks/workflows/useWorkflows";
import { useParams } from "next/navigation";
import { PipelineSchema } from "@/src/client/workflow";


function getFlowTheme(theme: MantineColorScheme): ColorMode {
	let flowTheme: ColorMode = "system";
	switch (theme) {
		case "auto":
			flowTheme = "system";
			break;
		case "dark":
			flowTheme = "dark";
			break;
		case "light":
			flowTheme = "light";
	}
	return flowTheme;
}

export function FlowCanvas() {
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

	const theme = useMantineTheme();
	const colorScheme = useMantineColorScheme();
	const flowTheme: ColorMode = getFlowTheme(colorScheme.colorScheme);
	const { screenToFlowPosition } = useReactFlow();

	const projectId = useParams<{project_id: string}>().project_id
	const { data: workflow } = useWorkflow(projectId)
	

	useEffect(() => {
		if (!workflow)
			return

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

			const newNode: AppNode = {
				id: nanoid(10),
				type,
				position,
				data: {
					label: `${type} node`,
				},
			};

			setNodes(nodes.concat(newNode));
		},
		[screenToFlowPosition, type],
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
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				colorMode={flowTheme}
				onDrop={onDrop}
				onDragOver={onDragOver}
				defaultViewport={{
					zoom: 1,
					x: 400,
					y: 200,
				}}
			>
				<Background
					style={{
						backgroundColor: "var(--mantine-color-body)",
					}}
					variant={BackgroundVariant.Dots}
				/>
				<Controls />
			</ReactFlow>
		</Box>
	);
}
