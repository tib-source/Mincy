import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { theme } from "@/theme";
import { createClient } from "@/utils/supabase/client";

// TODO: this is too slow, users can sometimes access screens they shouldn't
export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const supabase = createClient();
	const queryClient = new QueryClient();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				if (!session) {
					router.replace("/login");
					return;
				}
			} catch (error) {
				router.replace("/login");
			}
		};

		checkAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session) {
				router.replace("/login");
			}
		});

		return () => {
			if (subscription) {
				subscription.unsubscribe();
			}
		};
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider theme={theme}>
				<Notifications />
				{children}
			</MantineProvider>
		</QueryClientProvider>
	);
}
