'use client';

import {AuthContext} from "@/components/AuthProvider";
import {useCallback, useContext, useEffect, useState} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import Link from "next/link";

export default async function ShowProjects() {
    const {accessToken, user} = useContext(AuthContext);

    const supabase = createClientComponentClient<Database>()
    const [loading, setLoading] = useState(true)
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);

    const getProfile = useCallback(async () => {
        try {
            setLoading(true)

            // const { data, error, status } = await supabase
            //     .from('profiles')
            //     .select(`id, username, email`)
            //     .eq('id', user?.id)
            //     .single()

            const { data, error, status } = await supabase
                .from('projects')
                .select()
                // .select(`id, username, email`)
                // .eq('id', user?.id)
                // .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                console.log(data)
                setProjects(data)
            }
        } catch (error) {
            // alert('Error loading user data!')
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

    useEffect(() => {
        getProfile()
    }, [user, getProfile])

    if (loading) return <p>Loading Projects...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Projects</h1>
            {/*<p>{projects}</p>*/}
            {/*<p>{projects.id}: {projects.email}</p>*/}
            {/*{projects.map((project, index) => (*/}
            {/*    <div key={index}>*/}
            {/*        <p>{project.id}: {project.name}</p>*/}
            {/*    </div>*/}
            {/*))}*/}
            <div className="flex flex-wrap -mx-4">
                {projects.map((project) => (
                    <div key={project.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
                        <Link href={`/projects/${project.id}`} passHref>
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="p-5">
                                <h5 className="text-lg font-bold mb-2">{project.name}</h5>
                                <p className="text-gray-700 text-base">{project.description}</p>
                            </div>
                        </div>
                        </Link>
                    </div>
                ))}
            </div>

        </div>
    );
}
