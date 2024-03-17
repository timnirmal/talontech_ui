'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import Link from "next/link";
import {useEffect, useState} from "react";

const cards = [
    // Example card data
    {id: 1, title: 'Summarize', imageUrl: '/Summarize.png', link: '/tools/summarize'},
    {id: 2, title: 'Categorize', imageUrl: '/Categorize.png', link: '/tools/categorize'},
    {id: 3, title: 'Extract Data', imageUrl: '/Extract.png', link: '/tools/extractdata'},
    {id: 4, title: 'Generate Docs', imageUrl: '/Generate 02.png', link: '/tools/generatedocs'},
];

export default function ShowProjectData({params}: { params: { id: string } }) {
    const supabase = createClientComponentClient<Database>();
    const [projects, setProjects] = useState([{}]);


    // get project data
    useEffect(() => {
        const getProject = async () => {
            const {data, error, status} = await supabase
                .from('projects')
                .select()
                .eq('id', params.id)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                console.log(data)
                setProjects(data)
            }
        }
        getProject()
    }, [])

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 p-8">
            <div className="bg-gray-800 shadow-lg rounded-lg p-6 pt-16 text-gray-300">
                <h2 className="text-3xl font-semibold text-center">Projects {projects.name}</h2>
                <div className="bg-gray-900 text-gray-300 min-h-screen p-8 mt-10">
                    <div className="flex flex-wrap -mx-4">
                        {cards.map((card) => (
                            <div key={card.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 mb-8">
                                <Link href={card.link}
                                      className="block bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                                    <div className="relative h-48 w-full">
                                        <img src={card.imageUrl} alt={card.title} className="h-full mx-auto my-auto"/>
                                        {/*<Image src={card.imageUrl} alt={card.title} priority={false}*/}
                                        {/*       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"*/}
                                        {/*/>*/}
                                        {/*<p>Loading...</p>*/}
                                    </div>
                                    <div className="p-4">
                                        <h5 className="text-lg font-semibold">{card.title}</h5>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

    )
}
