import { createServerClient } from "@supabase/ssr";
import { createGitHubClient } from "@/src/client/gitClient";
import { createClient } from "../supabase/server";



export async function getGithubClient(){
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	const user = await supabase.auth.getUser();

	if (!session?.provider_token) {
        throw new Error("Not authenticated");
	}

	return {
		githubClient: createGitHubClient({ accessToken: session.provider_token }),
	};
}
