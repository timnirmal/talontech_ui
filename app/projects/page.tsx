import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import ShowProjects from "@/app/projects/showProjects";

export default async function Projects() {
    const supabase = createServerComponentClient({cookies});

    return (
        <div>
            <ShowProjects supabase={supabase} />
        </div>
    );

}
