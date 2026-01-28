import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export function Search() {
	return (
		<Input placeholder="Search..." leftSection={<IconSearch size={16} />} />
	);
}
