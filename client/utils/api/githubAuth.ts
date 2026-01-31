import { createGitHubClient } from "@/src/client/gitClient";
import { createClient } from "../supabase/server";
import { createServerClient } from "@supabase/ssr";

type GitHubClientRequest = 
    | { ok :true; githubClient: ReturnType <typeof createGitHubClient>, supabase: Awaited<ReturnType<typeof createClient>>; 
 }
    | { ok: false; error: string}

export async function getGithubClient() : Promise<GitHubClientRequest> {
    const supabase = await createClient()
    const { data : { session }} = await supabase.auth.getSession()
	const user =  await supabase.auth.getUser()

    if (!session?.provider_token ) { 
        return { ok: false, error: "Not authenticated" };
    }

    return {
        ok: true,
        githubClient: createGitHubClient({ accessToken: session.provider_token }),
        supabase: supabase
    };
}