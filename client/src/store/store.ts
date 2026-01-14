import { create } from "zustand";
import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import { theme } from "@/theme";
import { MantineColorScheme, useMantineColorScheme } from "@mantine/core";

export type AppNode = Node;

export type DesignerState = {
  nodes: AppNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
};
export const useDesignerStore = create<DesignerState>((set, get)=>({
    nodes: [],
    edges: [],
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes)
        })
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges)
        })
    }, 
    onConnect: (connection) => {
        set({
            edges: addEdge(connection, get().edges)
        })
    },
    setNodes: (nodes) => {
        set({ nodes });
    },
    setEdges: (edges) => {
        set({ edges });
    },

}))


export type NavBarState = { 
    docked: boolean;
    navbarWidth: number;
    headerHeight: number;
    setDocked: (value: boolean) => void;
}

export const useNavBarState = create<NavBarState>((set, get)=>({
    docked: false,
    navbarWidth: 250,
    headerHeight: 56,
    setDocked: (value) => set({
        docked: value
    })
}))


export type AppState = {
    theme: MantineColorScheme;
    setTheme: (value: MantineColorScheme) => void
}

// export const useAppState = create<AppState>((set)=>({
//     theme: useMantineColorScheme().colorScheme,
//     setTheme: (value) => set({
//         theme: value
//     }) 
// }))