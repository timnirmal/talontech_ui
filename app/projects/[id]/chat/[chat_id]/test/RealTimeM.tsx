'use client';

import {useEffect, useState} from "react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import DOMPurify from 'dompurify';


export default function RealTimeM({messageTree, combinedMessages}: { messageTree: any, combinedMessages: any }) {
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

    const sanitizedHtml = DOMPurify.sanitize(combinedMessages);

    return (
        <div className="flex-1 p-5 overflow-auto">
            {messages.map((message) => {
                // const sender = getMessageSender(message.senderId); // Assuming you have senderId in your message data
                return (
                    <div>
                        <div key={message.message_id} className="flex items-start space-x-2 mb-4">
                            <img src={'/profile_image.png'} alt=""
                                 className="w-10 h-10 rounded-full object-cover"/>
                            <div
                                className={`flex flex-col rounded ${message.type === 'user' ? 'bg-blue-100' : 'bg-green-100'} p-2`}>
                                <div className="font-bold">{"sender?.name"}</div>
                                <div>{message.text}</div>
                            </div>
                        </div>
                    </div>
                );
            })}
            {sanitizedHtml &&
            <div className="flex items-start space-x-2 mb-4">
                <img src={'/profile_image.png'} alt={"Sender Name"}
                     className="w-10 h-10 rounded-full object-cover"/>
                <div className={`flex flex-col rounded bg-green-100 p-2`}>
                    <div className="font-bold">Sender Name</div>
                    {/*<div>{message.text}</div>*/}
                    <div dangerouslySetInnerHTML={{__html: sanitizedHtml}}/>
                </div>
            </div>
            }
            {/*// show combinedMessages as HTML with dangerouslySetInnerHTML with same styling as above*/}


        </div>
    );
    // return (
    //     <div className="text-sm">
    //         <pre>{JSON.stringify(messages, null, 2)}</pre>
    //     </div>
    // );
}


{/*/!* Chat messages area *!/*/
}
{/*<div className="flex-1 p-5 overflow-auto">*/
}
{/*    {messages_demo.map((message) => {*/
}
{/*        const sender = getMessageSender(message.senderId);*/
}
{/*        return (*/
}
{/*            <div key={message.id} className="flex items-start space-x-2 mb-4">*/
}
{/*                /!* Sender Avatar *!/*/
}
{/*                <img src={sender?.avatar || '/default-avatar.png'} alt={sender?.name}*/}
{/*                     className="w-10 h-10 rounded-full object-cover"/>*/}
{/*                /!* Message Text and Sender's Name *!/*/}
{/*                <div*/}
{/*                    className={`flex flex-col rounded max-w-xs ${message.type === 'user' ? 'bg-blue-100' : 'bg-green-100'} p-2`}>*/}
{/*                    <div className="font-bold">{sender?.name}</div>*/}
{/*                    <div>{message.text}</div>*/}
{/*                </div>*/}
{/*            </div>*/}
{/*        );*/}
{/*    })}*/}
{/*</div>*/}