import { BaseNode, NodeExtraProp } from "./Base/BaseNode";
import { IconGitCommit } from "@tabler/icons-react";

export function GitCheckoutNode({preview}: NodeExtraProp) {
  // const onChange = useCallback((evt) => {
  //   console.log(evt.target.value);
  // }, []);
 
  return (
    <BaseNode 
      name="Git Checkout"
      icon={<IconGitCommit/>}
      valid={true}
      preview={preview}
    /> 
  );
}