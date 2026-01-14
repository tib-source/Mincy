import { nodeRegistry } from "@/src/nodes/registry";
import { useDesignerStore } from "@/src/store/store";
import { Box, MantineColorScheme, useMantineColorScheme } from "@mantine/core";
import { ReactFlow, Background, BackgroundVariant, Controls, ColorMode } from "@xyflow/react";
import { useEffect, useState } from "react";


const initialNodes = [
  {
    id: 'n2',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1' },
    type: 'GitCheckoutNode',
  },
  {
    id: 'n1',
    position: { x: 100, y: 100 },
    data: { label: 'Node 1' },
    type: 'TriggerNode',
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
    let flowTheme: ColorMode = 'system'
    switch(theme){
        case "auto":
            flowTheme = 'system'
            break;
        case "dark":
            flowTheme = 'dark'
            break;
        case "light":
            flowTheme = 'light' 
    }
    return flowTheme
}


export function FlowCanvas(){
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges
    } = useDesignerStore()
    const [mounted, setMounted] = useState(false);

    let theme = useMantineColorScheme().colorScheme
    let flowTheme: ColorMode = getFlowTheme(theme)
    useEffect(()=>{
        setNodes(initialNodes)
        setEdges(initialEdges)
    },[])

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    console.log(theme, flowTheme)


    const nodeTypes = Object.fromEntries(nodeRegistry.map(node=>[node.type, node.component]))

    return <Box
        flex={1}
        h="100%"
        pos="relative"
      >
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
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
        </ReactFlow>
      </Box>
}