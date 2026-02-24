export const BASE_WORKFLOW = {
    nodes: [
        {
            id: "n2",
            position: { x: 0, y: 0 },
            data: { label: "Node 1" },
            type: "GitCheckoutNode",
        },
        {
            id: "n1",
            position: { x: 100, y: 100 },
            data: { label: "Node 1" },
            type: "TriggerNode",
        },
    ],
    edges: [
        {
            id: "n1-n2",
            source: "n1",
            target: "n2",
        },
    ]
} 