import { BaseNode, NodeExtraProp } from "./Base/BaseNode";
import { IconGitCommit } from "@tabler/icons-react";
import { NodeDefinition } from "./registry";
import { NodeProps } from "@xyflow/react";


export const GitCheckoutNodeDefinition : NodeDefinition =   {
    type: "GitCheckoutNode",
    label: "Git Checkout",
    icon: IconGitCommit,
    component: GitCheckoutNode,
    category: "Source",
    color: 'oklch(0.65 0.15 160)',
    description : "Clone a repository"
  }



export function GitCheckoutNode({selected}: NodeProps) {
  // const onChange = useCallback((evt) => {
  //   console.log(evt.target.value);
  // }, []);
 
  return (
    <BaseNode 
      node={GitCheckoutNodeDefinition}
      valid={true}
      selected={selected}
    /> 
  );
}