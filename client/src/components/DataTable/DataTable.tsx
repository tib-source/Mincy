import type { ReactNode } from "react";
import classes from "./DataTable.module.css";

export interface DataTableColumn<T> {
	key: string;
	label: string;
	width?: number | string;
	render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
	columns: DataTableColumn<T>[];
	data: T[];
	getKey: (item: T) => string;
	onRowClick?: (item: T) => void;
}

export function DataTable<T>({ columns, data, getKey, onRowClick }: DataTableProps<T>) {
	return (
		<div className={classes.wrapper}>
			<table className={classes.table}>
				<colgroup>
					{columns.map((col) => (
						<col key={col.key} style={col.width ? { width: col.width } : undefined} />
					))}
				</colgroup>
				<thead className={classes.thead}>
					<tr>
						{columns.map((col) => (
							<th key={col.key}>{col.label}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((item) => (
						<tr
							key={getKey(item)}
							className={classes.row}
							onClick={onRowClick ? () => onRowClick(item) : undefined}
							style={onRowClick ? undefined : { cursor: "default" }}
						>
							{columns.map((col) => (
								<td key={col.key}>{col.render(item)}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
