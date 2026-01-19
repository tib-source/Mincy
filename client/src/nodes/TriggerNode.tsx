import { Input } from "@mantine/core";
import { BaseNode, NodeExtraProp } from "./Base/BaseNode";
import { IconCalendar, IconGitCommit, IconGitPullRequest, IconPlayerPlay, IconRocket, IconTag, IconWebhook } from "@tabler/icons-react";
import { NodeDefinition } from "./registry";
import { NodeProps } from "@xyflow/react";
import { useState } from "react";


export const TriggerNodeDefinition: NodeDefinition =   {
    type: "TriggerNode",
    label: "Trigger",
    icon: IconPlayerPlay,
    component: TriggerNode,
    category: "Source",
    color: 'oklch(0.72 0.16 45)',
    description: "start your workflow"
}

export type TriggerType = 'manual' | 'commit' | 'schedule' | 'webhook' | 'tag' | 'pull_request'

interface TriggerOptions{
  type: TriggerType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const triggerOptions: TriggerOptions[] = [
  { type: 'manual', label: 'Manual', icon: <IconPlayerPlay className="w-4 h-4" />, description: 'Trigger manually via UI or API' },
  { type: 'commit', label: 'On Push', icon: <IconGitCommit className="w-4 h-4" />, description: 'When code is pushed to branch' },
  { type: 'pull_request', label: 'Pull Request', icon: <IconGitPullRequest className="w-4 h-4" />, description: 'On PR open, update, or merge' },
  { type: 'schedule', label: 'Scheduled', icon: <IconCalendar className="w-4 h-4" />, description: 'Run on a cron schedule' },
  { type: 'webhook', label: 'Webhook', icon: <IconWebhook className="w-4 h-4" />, description: 'Trigger via external webhook' },
  { type: 'tag', label: 'On Tag', icon: <IconTag className="w-4 h-4" />, description: 'When a tag is created' },
]
export function TriggerNode({selected}: NodeProps) {
  const [enabledTiggers, setEnabledTriggers ] = useState<TriggerType[]>([])

  const details = (
    <>
        <Input/>
    </>
  )
 
  return (
    <BaseNode 
        node={TriggerNodeDefinition}
        valid={false}
        details={details}
        hasInput={false}
        color={TriggerNodeDefinition.color}
        selected={selected}

    /> 
  );
}