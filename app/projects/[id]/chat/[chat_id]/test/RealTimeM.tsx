// 'use client';
//
// import {useEffect, useState} from "react";
// import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
// import {Database} from "@/types/supabase";
// import DOMPurify from 'dompurify';
// import {MessageNode} from "@/app/projects/[id]/chat/[chat_id]/messageNode";
//
//
// export default function RealTimeM({messageTree, combinedMessages}: { messageTree: any, combinedMessages: any }) {
//     const supabase = createClientComponentClient<Database>();
//     // const [messages, setMessages] = useState(ServerPosts);
//     const [localMessageTree, setLocalMessageTree] = useState(messageTree);
//
//     useEffect(() => {
//         console.log("Calling useEffect")
//         // console.log("ServerPosts", ServerPosts);
//
//         const channel = supabase.channel('realtime chats')
//             .on("postgres_changes", {
//                     event: "INSERT",
//                     schema: "public",
//                     table: "chat_message"
//                 }, (payload) => {
//                     console.log("payload", payload.new);
//                     // setMessages(currentMessages => [...currentMessages, payload.new]);
//                     const rootNode = new MessageNode(payload.new);
//                     setLocalMessageTree(currentTree => [...currentTree, rootNode]);
//                 }
//             )
//             .on('postgres_changes', {
//                 event: 'UPDATE',
//                 schema: 'public',
//                 table: 'chat_message',
//             }, payload => {
//                 // setMessages(currentMessages => currentMessages.map(msg => msg.message_id === payload.new.message_id ? payload.new : msg));
//                 setLocalMessageTree(currentTree => {
//                     const rootNode = currentTree.find(root => root.findNodeById(payload.new.message_id));
//                     if (rootNode) {
//                         rootNode.updateReply(payload.new);
//                     }
//                     return [...currentTree];
//                 });
//             })
//             .on('postgres_changes', {
//                 event: 'DELETE',
//                 schema: 'public',
//                 table: 'chat_message',
//             }, payload => {
//                 // setMessages(currentMessages => currentMessages.filter(msg => msg.message_id !== payload.old.message_id));
//                 setLocalMessageTree(currentTree => {
//                     const rootNode = currentTree.find(root => root.findNodeById(payload.old.message_id));
//                     if (rootNode) {
//                         rootNode.deleteReply(payload.old.message_id);
//                     }
//                     return [...currentTree];
//                 });
//             })
//             .subscribe();
//
//         return () => {
//             console.log("Unsubscribing")
//             supabase.removeChannel(channel)
//         }
//     }, [])
//
//     const sanitizedHtml = DOMPurify.sanitize(combinedMessages);
//
//     const renderVersionControls = (node) => {
//         return (
//             <div className="flex items-center space-x-2">
//                 <button
//                     onClick={() => {
//                         node.prevVersion();
//                         setLocalMessageTree([...localMessageTree]); // Trigger a state update to re-render
//                     }}
//                     disabled={node.currentVersionIndex === 0}
//                 >
//                     {"<"}
//                 </button>
//                 <button
//                     onClick={() => {
//                         node.nextVersion();
//                         setLocalMessageTree([...localMessageTree]); // Trigger a state update to re-render
//                     }}
//                     disabled={node.currentVersionIndex >= node.versions.length - 1}
//                 >
//                     {">"}
//                 </button>
//             </div>
//         );
//     };
//
//     const renderMessageNode = (node) => {
//         const currentVersion = node.getCurrentVersion(); // Get the currently displayed version
//         return (
//             <div key={currentVersion.data.message_id} className="flex items-start space-x-2 mb-4">
//                 <img src={'/profile_image.png'} alt={currentVersion.data.sender_name || "Sender"}
//                      className="w-10 h-10 rounded-full object-cover" />
//                 <div className={`flex flex-col rounded ${currentVersion.data.type === 'user' ? 'bg-blue-100' : 'bg-green-100'} p-2`}>
//                     <div className="font-bold">{currentVersion.data.sender_name || "Unknown Sender"}</div>
//                     <div>{currentVersion.data.text}</div>
//                     {/* Include version navigation if there are multiple versions */}
//                     {node.versions.length > 1 && renderVersionControls(node)}
//                     {/* Render replies if any */}
//                     {currentVersion.replies && currentVersion.replies.map(reply => renderMessageNode(reply))}
//                 </div>
//             </div>
//         );
//     };
//
//     return (
//         <div className="flex-1 p-5 overflow-auto">
//             {console.log("localMessageTree", localMessageTree)}
//             {/* Render the message tree */}
//             {localMessageTree.map(node => renderMessageNode(node))}
//
//             {/* Optionally render combinedMessages */}
//             {sanitizedHtml && (
//                 <div className="mt-4 p-2 bg-gray-100 rounded shadow" dangerouslySetInnerHTML={{__html: sanitizedHtml}}/>
//             )}
//         </div>
//     );
//     // return (
//     //     <div className="text-sm">
//     //         <pre>{JSON.stringify(messages, null, 2)}</pre>
//     //     </div>
//     // );
// }
//
//
// {/*/!* Chat messages area *!/*/
// }
// {/*<div className="flex-1 p-5 overflow-auto">*/
// }
// {/*    {messages_demo.map((message) => {*/
// }
// {/*        const sender = getMessageSender(message.senderId);*/
// }
// {/*        return (*/
// }
// {/*            <div key={message.id} className="flex items-start space-x-2 mb-4">*/
// }
// {/*                /!* Sender Avatar *!/*/
// }
// {/*                <img src={sender?.avatar || '/default-avatar.png'} alt={sender?.name}*/}
// {/*                     className="w-10 h-10 rounded-full object-cover"/>*/}
// {/*                /!* Message Text and Sender's Name *!/*/}
// {/*                <div*/}
// {/*                    className={`flex flex-col rounded max-w-xs ${message.type === 'user' ? 'bg-blue-100' : 'bg-green-100'} p-2`}>*/}
// {/*                    <div className="font-bold">{sender?.name}</div>*/}
// {/*                    <div>{message.text}</div>*/}
// {/*                </div>*/}
// {/*            </div>*/}
// {/*        );*/}
// {/*    })}*/}
// {/*</div>*/}