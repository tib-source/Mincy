import type { NodeProps } from "@xyflow/react";
import { BaseNode } from "./Base/BaseNode";
import type { NodeDefinition } from "./registry";
import { resolveIcon } from "./iconMap";
import manifests from "../generated/node-manifests.json";

function createMarketplaceComponent(def: NodeDefinition) {
	function MarketplaceNodeComponent({ selected }: NodeProps) {
		return <BaseNode node={def} selected={selected} valid />;
	}
	MarketplaceNodeComponent.displayName = `MarketplaceNode(${def.type})`;
	return MarketplaceNodeComponent;
}

const BUILT_IN_TYPES = new Set(["TriggerNode", "ScriptNode", "stage"]);

export const marketplaceNodeDefinitions: NodeDefinition[] = manifests
	.filter((m) => !BUILT_IN_TYPES.has(m.type))
	.map((m) => {
		const def: NodeDefinition = {
			type: m.type,
			label: m.label,
			category: m.category,
			color: m.color,
			description: m.description,
			icon: resolveIcon(m.icon),
			component: () => null, 
		};
		def.component = createMarketplaceComponent(def);
		return def;
	});
