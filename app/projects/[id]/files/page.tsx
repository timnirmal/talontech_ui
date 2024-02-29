import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import ShowProjects from "@/app/projects/showProjects";
import NewProject from "@/app/projects/addProject";
import {Database} from "@/types/supabase";
import NewFiles from "@/app/projects/[id]/files/addFiles";
import ChatWindowStarter from "@/app/projects/[id]/chatWindowStarter";
import Sidebar from "@/app/projects/[id]/sideBar";
import ShowFiles from "@/app/projects/[id]/files/showFiles";

export default async function FilesView({ params }: { params: { id: string } }) {
    // const supabase = createServerComponentClient({cookies});
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()

    return (
        <div>
            <NewFiles pageId={params.id}/>
            <ShowFiles params={params}/>
        </div>
    )
}
