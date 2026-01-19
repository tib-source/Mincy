import { useMemo } from "react";
import { NodeDefinition } from "../nodes/registry";


export function useComponentTree(nodes: NodeDefinition[]){
    return useMemo(()=> {

    let categoryMap: Record<string, NodeDefinition[]> = {} 
    for (let node of nodes){
        // ??= will only asign the value if hte left side is null / undefined
        // pretty neat trick haha 
        (categoryMap[node.category] ??= []).push(node)
    }
    
    return {
        categories: Object.keys(categoryMap),
        categoryMap
    }}, [nodes])
}