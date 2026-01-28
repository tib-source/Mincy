import { type MantineColorScheme, useMantineColorScheme } from "@mantine/core";
import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	type Edge,
	type Node,
	type OnConnect,
	type OnEdgesChange,
	type OnNodesChange,
} from "@xyflow/react";
import { create } from "zustand";
import { theme } from "@/theme";

export type AppNode = Node;

export type DesignerState = {
	nodes: AppNode[];
	edges: Edge[];
	onNodesChange: OnNodesChange<AppNode>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	setNodes: (nodes: AppNode[]) => void;
	setEdges: (edges: Edge[]) => void;
	updateNodeData: (id: string, patch: any) => void;
};

export const useDesignerStore = create<DesignerState>((set, get) => ({
	nodes: [],
	edges: [],
	onNodesChange: (changes) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		});
	},
	onEdgesChange: (changes) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		});
	},
	onConnect: (connection) => {
		set({
			edges: addEdge(connection, get().edges),
		});
	},
	setNodes: (nodes) => {
		set({ nodes });
	},
	setEdges: (edges) => {
		set({ edges });
	},
	updateNodeData: (id, patch) => {
		set((state) => ({
			nodes: state.nodes.map((node) => {
				return node.id === id
					? { ...node, data: { ...node.data, ...patch } }
					: node;
			}),
		}));
	},
}));

export type NavBarState = {
	docked: boolean;
	navbarWidth: number;
	headerHeight: number;
	setDocked: (value: boolean) => void;
};

export const useNavBarState = create<NavBarState>((set, get) => ({
	docked: false,
	navbarWidth: 250,
	headerHeight: 56,
	setDocked: (value) =>
		set({
			docked: value,
		}),
}));

export type AppState = {
	theme: MantineColorScheme;
	setTheme: (value: MantineColorScheme) => void;
};
