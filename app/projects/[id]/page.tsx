import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import ShowProjects from "@/app/projects/showProjects";
import NewProject from "@/app/projects/addProject";
import {Database} from "@/types/supabase";
import NewFiles from "@/app/projects/[id]/addFiles";
import ChatWindow from "@/app/projects/[id]/chatWindow";

export default async function ProjectsView({ params }: { params: { id: string } }) {
    // const supabase = createServerComponentClient({cookies});
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()

    return (
        <div>
            <ChatWindow params={params}/>
            {/*<NewFiles pageId={params.id}/>*/}
        </div>
    )
}
