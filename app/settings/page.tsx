import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import ShowProjects from "@/app/projects/showProjects";
import NewProject from "@/app/projects/addProject";
import {Database} from "@/types/supabase";

export default async function Settings() {
    // const supabase = createServerComponentClient({cookies});
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()

    return (
        <div>
            <ShowProjects/>
            <NewProject/>
        </div>
    )
}
