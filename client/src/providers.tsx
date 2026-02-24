"use client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { theme } from "@/theme";

// TODO: this is too slow, users can sometimes access screens they shouldn't
export function Providers({ children }: { children: React.ReactNode }) {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider theme={theme}>
				<Notifications />
				{children}
			</MantineProvider>
		</QueryClientProvider>
	);
}
