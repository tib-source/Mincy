import { Input } from "@mantine/core";
import { BaseNode, NodeExtraProp } from "./Base/BaseNode";
import { IconGitCommit } from "@tabler/icons-react";
import { Handle, Position } from "@xyflow/react";



export function TriggerNode({preview}: NodeExtraProp) {
  // const onChange = useCallback((evt) => {
  //   console.log(evt.target.value);
  // }, []);

  const details = (
    <>
        <Input/>
    </>
  )
 
  return (
    <BaseNode 
        name="Trigger"
        icon={<IconGitCommit/>}
        valid={false}
        details={details}
        inputHandle={false}
        preview={preview}

    /> 
  );
}