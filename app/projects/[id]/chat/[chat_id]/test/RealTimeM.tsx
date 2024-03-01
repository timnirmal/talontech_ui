'use client';

import {useEffect, useState} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";


export default function RealTimeM({ServerPosts,}: { ServerPosts }) {
    const supabase = createClientComponentClient<Database>();
    const [messages, setMessages] = useState(ServerPosts);

    useEffect(() => {
        console.log("Calling useEffect")
        console.log("ServerPosts", ServerPosts);

        const channel = supabase.channel('realtime chats')
            .on("postgres_changes", {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_message"
                }, (payload) => {
                    console.log("payload", payload.new);
                    setMessages(currentMessages => [...currentMessages, payload.new]);
                }
            )
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_message',
            }, payload => {
                setMessages(currentMessages => currentMessages.map(msg => msg.message_id === payload.new.message_id ? payload.new : msg));
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'chat_message',
            }, payload => {
                setMessages(currentMessages => currentMessages.filter(msg => msg.message_id !== payload.old.message_id));
            })
            .subscribe();

        return () => {
            console.log("Unsubscribing")
            supabase.removeChannel(channel)
        }
    }, [])
    return (
        <div>
            {ServerPosts.map((post) => (
                <div key={post.message_id}>
                    <p>{post.text}</p>
                </div>
            ))}
        </div>
    );
    // return (
    //     <div className="text-sm">
    //         <pre>{JSON.stringify(messages, null, 2)}</pre>
    //     </div>
    // );
}