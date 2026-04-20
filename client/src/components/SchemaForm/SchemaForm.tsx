import {
	NumberInput,
	Select,
	Stack,
	Switch,
	Textarea,
	TextInput,
} from "@mantine/core";
import type { InputSchema } from "@mincy/shared";

export type Inputs = Record<string, InputSchema>;
export type Values = Record<string, unknown>;
export type Errors = Record<string, string>;

interface SchemaFormProps {
	inputs: Inputs;
	values: Values;
	errors?: Errors;
	onChange: (next: Values) => void;
}

export function SchemaForm({
	inputs,
	values,
	errors,
	onChange,
}: SchemaFormProps) {
	const set = (key: string, value: unknown) => {
		onChange({ ...values, [key]: value });
	};

	return (
		<Stack gap="xs">
			{Object.entries(inputs).map(([key, schema]) => {
				const label = schema.label ?? key;
				const error = errors?.[key];
				const current = values[key] ?? schema.default ?? "";

				switch (schema.type) {
					case "string":
						return schema.multiline ? (
							<Textarea
								key={key}
								label={label}
								description={schema.description}
								required={schema.required}
								error={error}
								value={String(current)}
								onChange={(e) => set(key, e.currentTarget.value)}
							/>
						) : (
							<TextInput
								key={key}
								label={label}
								description={schema.description}
								required={schema.required}
								type={schema.secret ? "password" : "text"}
								error={error}
								value={String(current)}
								onChange={(e) => set(key, e.currentTarget.value)}
							/>
						);

					case "number":
						return (
							<NumberInput
								key={key}
								label={label}
								description={schema.description}
								required={schema.required}
								min={schema.min}
								max={schema.max}
								error={error}
								value={typeof current === "number" ? current : ""}
								onChange={(v) => set(key, v)}
							/>
						);

					case "boolean":
						return (
							<Switch
								key={key}
								label={label}
								description={schema.description}
								checked={Boolean(current)}
								onChange={(e) => set(key, e.currentTarget.checked)}
							/>
						);

					case "select":
						return (
							<Select
								key={key}
								label={label}
								description={schema.description}
								required={schema.required}
								data={(schema.options ?? []).map((o) => ({
									value: o,
									label: o,
								}))}
								error={error}
								value={current ? String(current) : null}
								onChange={(v) => set(key, v)}
							/>
						);

					default:
						return null;
				}
			})}
		</Stack>
	);
}

export function validateSchema(inputs: Inputs, values: Values): Errors {
	const errors: Errors = {};

	for (const [key, schema] of Object.entries(inputs)) {
		const value = values[key] ?? schema.default;
		const label = schema.label ?? key;

		const missing =
			value === undefined ||
			value === null ||
			(typeof value === "string" && value.trim() === "");

		if (schema.required && missing) {
			errors[key] = `${label} is required`;
			continue;
		}
		if (missing) {
			continue;
		}

		switch (schema.type) {
			case "number": {
				const num = typeof value === "number" ? value : Number(value);
				if (Number.isNaN(num)) {
					errors[key] = `${label} must be a number`;
				} else if (schema.min !== undefined && num < schema.min) {
					errors[key] = `${label} must be ≥ ${schema.min}`;
				} else if (schema.max !== undefined && num > schema.max) {
					errors[key] = `${label} must be ≤ ${schema.max}`;
				}
				break;
			}
			case "select": {
				if (schema.options && !schema.options.includes(String(value))) {
					errors[key] = `${label} must be one of ${schema.options.join(", ")}`;
				}
				break;
			}
		}
	}

	return errors;
}
