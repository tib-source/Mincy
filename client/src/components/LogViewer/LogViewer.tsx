"use client";
import { ActionIcon, Group, ScrollArea, Text, Tooltip } from "@mantine/core";
import { IconDownload, IconSearch } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import type { LogEntry } from "@/src/client/runs";
import classes from "./LogViewer.module.css";

interface LogViewerProps {
	logs: LogEntry[];
	isLoading?: boolean;
	isLive?: boolean;
	title?: string;
	subtitle?: string;
}

export function LogViewer({
	logs,
	isLoading,
	isLive,
	title,
	subtitle,
}: LogViewerProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTo({
				top: scrollRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [logs.length]);

	return (
		<div className={classes.terminal}>
			<div className={classes.terminalHeader}>
				<Group gap={0}>
					<span className={classes.terminalTitle}>{title || "Logs"}</span>
					{subtitle && (
						<>
							<Text c="#484f58" mx={8} size="sm">
								/
							</Text>
							<span className={classes.terminalSubtitle}>{subtitle}</span>
						</>
					)}
				</Group>
				<Group gap={4}>
					<Tooltip label="Find" position="bottom">
						<ActionIcon variant="subtle" color="gray" size="sm">
							<IconSearch size={14} color="#8b949e" />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Download" position="bottom">
						<ActionIcon variant="subtle" color="gray" size="sm">
							<IconDownload size={14} color="#8b949e" />
						</ActionIcon>
					</Tooltip>
				</Group>
			</div>

			{/* Log content */}
			<div className={classes.terminalBody}>
				<ScrollArea
					h="100%"
					viewportRef={scrollRef}
					scrollbarSize={6}
					type="hover"
					scrollbars="y"
				>
					<div className={classes.logContent}>
						{logs.length === 0 && (
							<div className={classes.emptyState}>
								<span className={classes.emptyText}>
									{isLoading ? "Waiting for logs..." : "No logs available."}
									{isLive && <span className={classes.cursor} />}
								</span>
							</div>
						)}
						{logs.map((log, index) => {
							const level = log.level?.toLowerCase() || "info";
							const time = log.timestamp
								? new Date(log.timestamp).toLocaleTimeString("en-US", {
										hour12: false,
										hour: "2-digit",
										minute: "2-digit",
										second: "numeric",
									})
								: "";

							return (
								<div key={log.id} className={classes.line}>
									<span className={classes.lineNumber}>{index + 1}</span>
									<span className={classes.timestamp}>[{time}]</span>
									<span className={classes.message} data-level={level}>
										{log.message}
									</span>
								</div>
							);
						})}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
