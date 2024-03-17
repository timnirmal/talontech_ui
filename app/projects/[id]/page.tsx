import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import Link from "next/link";
import ShowProjectData from "@/app/projects/[id]/ShowProjectData";


const cards = [
    // Example card data
    {id: 1, title: 'Summarize', imageUrl: '/Summarize.png', link: '/tools/summarize'},
    {id: 2, title: 'Categorize', imageUrl: '/Categorize.png', link: '/tools/categorize'},
    {id: 3, title: 'Extract Data', imageUrl: '/Extract.png', link: '/tools/extractdata'},
    {id: 3, title: 'Generate Docs', imageUrl: '/Generate 02.png', link: '/tools/generatedocs'},
];

export default async function ProjectsView({params}: { params: { id: string } }) {
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()


    return (
        <div className="">
            <ShowProjectData params={params}/>
        </div>

    )
}
