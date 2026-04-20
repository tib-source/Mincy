import type { NodeProps } from "@xyflow/react";
import type { NodeManifest } from "@mincy/shared";
import { useMemo } from "react";
import { BaseNode } from "./Base/BaseNode";
import type { NodeDefinition } from "./registry";
import { resolveIcon } from "./iconMap";
import { useDesignerStore } from "../store/store";
import {
	SchemaForm,
	validateSchema,
	type Values,
} from "@/src/components/SchemaForm/SchemaForm";
import manifests from "../generated/node-manifests.json";

const BUILT_IN_TYPES = new Set(["TriggerNode", "ScriptNode", "stage"]);
const EMPTY_ERRORS = Object.freeze({}) as Record<string, string>;

const marketplaceManifests = (manifests as NodeManifest[]).filter(
	(m) => !BUILT_IN_TYPES.has(m.type),
);

const manifestByType = new Map(marketplaceManifests.map((m) => [m.type, m]));
const definitionByType = new Map<string, NodeDefinition>();

function MarketplaceNode({ id, type, selected, data }: NodeProps) {
	const { updateNodeData } = useDesignerStore();
	const manifest = type ? manifestByType.get(type) : undefined;
	const def = type ? definitionByType.get(type) : undefined;
	const values = (data?.config as Values) ?? {};

	const errors = useMemo(
		() => (manifest ? validateSchema(manifest.inputs, values) : EMPTY_ERRORS),
		[manifest, values],
	);

	if (!manifest || !def) {
		return null;
	}

	const valid = Object.keys(errors).length === 0;
	const hasInputs = Object.keys(manifest.inputs).length > 0;

	const details = hasInputs ? (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions
		<div
			className="nodrag nopan"
			onKeyDown={(e) => e.stopPropagation()}
			onPointerDown={(e) => e.stopPropagation()}
			style={{ padding: 8 }}
		>
			<SchemaForm
				inputs={manifest.inputs}
				values={values}
				errors={errors}
				onChange={(next) => updateNodeData(id, { config: next })}
			/>
		</div>
	) : undefined;

	return (
		<BaseNode
			node={def}
			selected={selected}
			valid={valid}
			details={details}
			resizable={manifest.resizable}
			minwidth={manifest.minWidth}
			hasOutput={manifest.hasOutput}
			hasInput={manifest.hasInput}
			color={manifest.color}
		/>
	);
}

export const marketplaceNodeDefinitions: NodeDefinition[] =
	marketplaceManifests.map((m) => {
		const def: NodeDefinition = {
			type: m.type,
			label: m.label,
			category: m.category,
			color: m.color,
			description: m.description,
			icon: resolveIcon(m.icon),
			component: MarketplaceNode,
		};
		definitionByType.set(m.type, def);
		return def;
	});
