import { IconPencil, IconSubtask } from "@tabler/icons-react";
import {
	Handle,
	NodeResizer,
	Position,
	type NodeProps,
	useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NodeDefinition } from "../registry";
import classes from "./StageNode.module.css";
import { Group, TextInput } from "@mantine/core";

const STAGE_COLOR = "oklch(0.55 0.15 200)";

export const StageNodeDefinition: NodeDefinition = {
	type: "stage",
	label: "Stage",
	icon: IconSubtask,
	component: StageNode,
	category: "Source",
	color: STAGE_COLOR,
	description: "Group your steps",
};

export function StageNode({ id, selected, data }: NodeProps) {
	const { updateNodeData } = useReactFlow();
	const [editing, setEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const label = (data.label as string) || "Stage";
	const image = (data.image as string) || "";

	useEffect(() => {
		if (editing) {
			inputRef.current?.focus();
		}
	}, [editing]);

	const commitEdit = useCallback(() => {
		const value = inputRef.current?.value.trim();
		if (value) {
			updateNodeData(id, { label: value });
		}
		setEditing(false);
	}, [id, updateNodeData]);

	return (
		<>
			<NodeResizer
				isVisible={!!selected}
				minWidth={400}
				minHeight={400}
				lineStyle={{ borderColor: STAGE_COLOR }}
				handleStyle={{ backgroundColor: STAGE_COLOR, width: 8, height: 8 }}
			/>

			<div className={classes.stage} data-selected={selected}>
				<div className={classes.header}>
					<IconSubtask size={14} color={STAGE_COLOR} />
					{editing ? (
						<input
							ref={inputRef}
							className={classes.labelInput}
							defaultValue={label}
							onBlur={commitEdit}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									commitEdit();
								}
								if (e.key === "Escape") {
									setEditing(false);
								}
							}}
						/>
					) : (
						<Group
							onDoubleClick={() => setEditing(true)}
							className={classes.label}
						>
							<span>{label}</span>
							<IconPencil size={12} stroke={0} fill={STAGE_COLOR} />
						</Group>
					)}

					<TextInput
						size="xs"
						placeholder="Image : node:20-slim"
						value={image}
						onChange={(e) => updateNodeData(id, { image: e.target.value })}
						ml="auto"
					/>
				</div>
			</div>

			<Handle
				type="target"
				position={Position.Left}
				style={{ background: STAGE_COLOR }}
			/>
			<Handle
				type="source"
				position={Position.Right}
				style={{ background: STAGE_COLOR }}
			/>
		</>
	);
}
