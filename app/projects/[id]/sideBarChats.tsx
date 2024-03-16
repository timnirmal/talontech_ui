'use client';

import Link from "next/link";
import {createClientComponentClient, createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {useRouter} from 'next/navigation';

const SidebarChats = ({activeProjectId}) => {
    const supabase = createClientComponentClient<Database>();
    const [chatSessions, setChatSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const {user} = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        // console.log("Calling useEffect for get chat sessions")
        // Function to fetch initial chat sessions
        const fetchChatSessions = async () => {
            setIsLoading(true);
            const {data, error} = await supabase
                .from('chat_session')
                .select('*');

            if (error) {
                console.error('Error fetching chat sessions:', error);
            } else {
                setChatSessions(data);
            }
            setIsLoading(false);
        };

        // Call the fetch function
        fetchChatSessions();
    }, [user.id]); // Dependency array ensures this effect runs only once or when user.id changes

    useEffect(() => {
        // console.log("Calling useEffect for get updated chat messages")
        // console.log("ServerPosts", ServerPosts);

        const channel = supabase.channel('realtime chats')
            .on("postgres_changes", {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_message"
                }, (payload) => {
                    // console.log("Insert payload", payload.new);
                    setChatSessions((prev) => [...prev, payload.new]);
                }
            )
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_message',
            }, (payload) => {
                // console.log("Update payload", payload.new);
                // setChatSessions((prevSessions) => prevSessions.map(session => session.id === payload.new.id ? payload.new : session));
                // setChatSessions((prevSessions) => {
                //     const index = prevSessions.findIndex(session => session.id === payload.new.id);
                //     prevSessions[index] = payload.new;
                //     return prevSessions;
                // });
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'chat_message',
            }, (payload) => {
                // console.log("Delete payload", payload.new);
            })
            .subscribe();

        return () => {
            // console.log("Unsubscribing")
            supabase.removeChannel(channel)
        }
    }, [chatSessions, router]);


    // console.log(activeProjectId);

    if (isLoading) {
        return <div>Loading chat sessions...</div>;
    }


    return (
        <div className="">
            {/* Middle section for chat list */}
            <div className="p-2">
                {chatSessions.length > 0 ? (
                    <div>
                        {/* Loop through each session and create a button for it */}
                        {chatSessions.map((session) => (
                            <div key={session.chat_id} className="p-2 hover:bg-gray-700 cursor-pointer">
                                <button onClick={() => router.push(`/projects/${activeProjectId}/chat/${session.chat_id}`)}>
                                    <div>{session?.chat_name || session?.chat_id}</div>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p></p>
                )}
            </div>
        </div>
    );
};

export default SidebarChats;