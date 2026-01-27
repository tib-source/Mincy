import { theme } from "@/theme";
import { createClient } from "@/utils/supabase/client";
import { MantineProvider } from "@mantine/core";
import { Notifications, notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export function Providers({children}: {children: React.ReactNode}){
    const router = useRouter();
    const supabase = createClient()
  
    useEffect(() => {

      const checkAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            router.replace('/login');
            return;
          }
        } catch (error) {
          router.replace('/login');
        }
      };
  
      checkAuth();
  
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          router.replace('/login');
        }
      });
  
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }, [router]);
  
    return (
            <MantineProvider theme={theme}>
                <Notifications/>
                {children}
            </MantineProvider>
    )
}




