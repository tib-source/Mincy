import pino from "pino";

export const logger = pino({
	base: null,
	level: "info",
	transport: {
		target: "pino-pretty",
		options: { colorize: true },
	},
});
