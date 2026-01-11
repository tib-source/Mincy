"use client";

import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, ColorMode, NodeChange, EdgeChange, Connection, Node, Edge, Background, Controls, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MantineColorScheme, useMantineColorScheme } from '@mantine/core';
import { GitCheckoutNode } from '@/src/nodes/GitCheckoutNode';


const nodeTypes = {
  GitCheckoutNode
};

const initialNodes = [
  {
    id: 'n1',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1' },
    type: 'GitCheckoutNode',
  },
  {
    id: 'n2',
    position: { x: 100, y: 100 },
    data: { label: 'Node 2' },
  },
];
 
const initialEdges = [
  {
    id: 'n1-n2',
    source: 'n1',
    target: 'n2',
  },
];

function getFlowTheme (theme: MantineColorScheme): ColorMode{
    let flowTheme: ColorMode = "system"
    switch(theme){
        case "auto":
            flowTheme = "system"
            break;
        case "dark":
            flowTheme = "dark"
            break;
        case "light":
            flowTheme = "dark"   
    }
    return flowTheme
}

export default function ProjectEditPage() {
    let theme = useMantineColorScheme().colorScheme
    let flowTheme = getFlowTheme(theme)
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);


    const onNodesChange = useCallback(
      (changes: NodeChange<Node>[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
      [],
    );


    const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
      [],
    );

  return (
    <div style={{ width: "100%", height: 755
     }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        colorMode={flowTheme}
      >
        <Background  variant={BackgroundVariant.Dots} />
        <Controls />
        </ReactFlow>
    </div>
  );
}