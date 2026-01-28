"use client";
import {
	Center,
	Group,
	keys,
	ScrollArea,
	Table,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core";
import {
	IconChevronDown,
	IconChevronUp,
	IconSearch,
	IconSelector,
} from "@tabler/icons-react";
import { useState } from "react";
import classes from "./TableSort.module.css";

interface RowData {
	status: string;
	commit: string;
	branch: string;
	triggered_by: string;
	duration: string;
	time: string;
	[key: string]: string;
}

const cols = ["Status", "Commit", "Branch", "Triggered By", "Duration", "Time"];
interface ThProps {
	children: React.ReactNode;
	reversed: boolean;
	sorted: boolean;
	onSort: () => void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
	const Icon = sorted
		? reversed
			? IconChevronUp
			: IconChevronDown
		: IconSelector;
	return (
		<Table.Th className={classes.th}>
			<UnstyledButton onClick={onSort} className={classes.control}>
				<Group justify="space-between">
					<Text fw={500} fz="sm">
						{children}
					</Text>
					<Center className={classes.icon}>
						<Icon size={16} stroke={1.5} />
					</Center>
				</Group>
			</UnstyledButton>
		</Table.Th>
	);
}

function filterData(data: RowData[], search: string) {
	const query = search.toLowerCase().trim();
	return data.filter((item) =>
		keys(data[0]).some((key) => item[key].toLowerCase().includes(query)),
	);
}

function sortData(
	data: RowData[],
	payload: { sortBy: keyof RowData | null; reversed: boolean; search: string },
) {
	const { sortBy } = payload;

	if (!sortBy) {
		return filterData(data, payload.search);
	}

	return filterData(
		[...data].sort((a, b) => {
			if (payload.reversed) {
				return b[sortBy].localeCompare(a[sortBy]);
			}

			return a[sortBy].localeCompare(b[sortBy]);
		}),
		payload.search,
	);
}

const data: RowData[] = [
	{
		status: "success",
		commit: "Fixed xyz",
		branch: "main",
		triggered_by: "Tibebe Demissie",
		duration: "5m 02s",
		time: "3 hours ago",
	},
];
export function TableSort() {
	const [search, setSearch] = useState("");
	const [sortedData, setSortedData] = useState(data);
	const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
	const [reverseSortDirection, setReverseSortDirection] = useState(false);

	const setSorting = (field: keyof RowData) => {
		const reversed = field === sortBy ? !reverseSortDirection : false;
		setReverseSortDirection(reversed);
		setSortBy(field);
		setSortedData(sortData(data, { sortBy: field, reversed, search }));
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget;
		setSearch(value);
		setSortedData(
			sortData(data, { sortBy, reversed: reverseSortDirection, search: value }),
		);
	};

	const rows = sortedData.map((row, index) => (
		<Table.Tr key={index}>
			{Object.keys(row).map((value, index) => {
				return <Table.Td key={index}>{row[value]}</Table.Td>;
			})}
		</Table.Tr>
	));

	return (
		<ScrollArea>
			<TextInput
				placeholder="Search by any field"
				mb="md"
				leftSection={<IconSearch size={16} stroke={1.5} />}
				value={search}
				onChange={handleSearchChange}
			/>
			<Table
				horizontalSpacing="md"
				verticalSpacing="xs"
				miw={700}
				layout="fixed"
			>
				<Table.Tbody>
					<Table.Tr>
						{cols.map((col, index) => {
							return (
								<Th
									key={index}
									sorted={sortBy === col}
									reversed={reverseSortDirection}
									onSort={() => setSorting(col)}
								>
									{col}
								</Th>
							);
						})}
					</Table.Tr>
				</Table.Tbody>
				<Table.Tbody>
					{rows.length > 0 ? (
						rows
					) : (
						<Table.Tr>
							<Table.Td colSpan={Object.keys(data[0]).length}>
								<Text fw={500} ta="center">
									Nothing found
								</Text>
							</Table.Td>
						</Table.Tr>
					)}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	);
}
