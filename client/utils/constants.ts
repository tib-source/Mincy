export const ARTIFACTS_BUCKET = "artifacts";

export const BASE_WORKFLOW = {
	nodes: [
		{
			id: "n1",
			data: {
				label: "Trigger",
				config: {
					triggers: [
						{
							type: "manual",
							enabled: true,
						},
						{
							type: "commit",
							enabled: true,
							branches: ["main", "*"],
						},
					],
				},
			},
			type: "TriggerNode",
			dragging: false,
			measured: {
				width: 366,
				height: 338,
			},
			position: {
				x: -218,
				y: -14,
			},
			selected: true,
		},
	],
	edges: [],
};
