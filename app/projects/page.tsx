import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import ShowProjects from "@/app/projects/showProjects";
import NewProject from "@/app/projects/addProject";
import {Database} from "@/types/supabase";
import Link from 'next/link'; // Importing Link component


export default async function Projects() {
    // const supabase = createServerComponentClient({cookies});
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()

    const handleBack = () => {
    };

    return (
        <div class="m-10">
             <Link href="/" passHref>
                <button className="bg-transparent hover:bg-red-500 text-red-500 hover:text-white font-bold py-2 px-4 rounded m-5">
                    Back
                </button>
            </Link>
            <NewProject/>
            <hr class="mt-10 border-gray-300"/>
            <ShowProjects/>
            
        </div>
    )
}
