'use client';

import React, {useEffect, useMemo, useState} from 'react';
import AddFilesIcon from "@/app/projects/[id]/chat/addFilesIcon";
import {useManualServerSentEvents} from "@/hooks/useManualServerSentEvents";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import RealTimeM from "@/app/projects/[id]/chat/[chat_id]/test/RealTimeM";
import ChatComponent from "@/app/projects/[id]/chat/[chat_id]/ChatOperations";
import ChatStream from "@/app/projects/[id]/chat/[chat_id]/chatStream";
import {AuthContext} from "@/components/AuthProvider";
import {useChat} from './ChatContext';
import {
    // BranchResult,
    MessageNode
} from "@/app/projects/[id]/chat/[chat_id]/messageNode";

const MessageComponent = ({ node }: { node: MessageNode }) => {
    const messageData = node.getCurrentVersionData();

    return (
        <div>
            <div>Message: {messageData.text}</div> {/* Adjust to match your data structure */}
            {node.children.length > 0 && (
                <div className="children">
                    <br/>
                    {node.children.map(child => (
                        <MessageComponent key={child.getCurrentVersionData().message_id} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};
// const MessageComponent = ({ node }: { node: MessageNode }) => {
//     console.log("node", node.versions.text);
//     // Determine the initial version to display - default to the latest version
//     const [displayVersion, setDisplayVersion] = useState(node.currentVersion);
//
//     const messageData = node.versions[displayVersion];
//
//     // Handlers to navigate between versions
//     const handlePrevVersion = () => {
//         const sortedVersions = Object.keys(node.versions).map(Number).sort((a, b) => a - b);
//         const currentIdx = sortedVersions.indexOf(displayVersion);
//         if (currentIdx > 0) {
//             setDisplayVersion(sortedVersions[currentIdx - 1]);
//         }
//     };
//
//     const handleNextVersion = () => {
//         const sortedVersions = Object.keys(node.versions).map(Number).sort((a, b) => a - b);
//         const currentIdx = sortedVersions.indexOf(displayVersion);
//         if (currentIdx < sortedVersions.length - 1) {
//             setDisplayVersion(sortedVersions[currentIdx + 1]);
//         }
//     };
//
//     // Check if there are multiple versions to navigate through
//     const hasMultipleVersions = Object.keys(node.versions).length > 1;
//
//     return (
//         <div>
//             <div>
//                 {/*{messageData.message_id}: {messageData.text} /!* Adjust to match your data structure *!/*/}
//                 Message: {messageData.text} {/* Adjust to match your data structure */}
//                 {hasMultipleVersions && (
//                     <div>
//                         <button onClick={handlePrevVersion}>&lt;</button>
//                         Version {displayVersion}
//                         <button onClick={handleNextVersion}>&gt;</button>
//                     </div>
//                 )}
//             </div>
//             {node.children.length > 0 && (
//                 <div className="children">
//                     {node.children.map(child => (
//                         <MessageComponent key={child.getCurrentVersionData().message_id} node={child} />
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

export default function ChatWindow({params}: { params: { id: string } }) {
    const [imageData, setImageData] = useState(null);
    const [imageDataUrl, setImageDataUrl] = useState(null);
    const [currentFiles, setCurrentFiles] = useState({});
    const [messageText, setMessageText] = useState("")
    const supabase = createClientComponentClient<Database>();
    // const [serverPosts, setServerPosts] = useState([]); // Use state to hold server posts
    const [isLoading, setIsLoading] = useState(true);
    const [chatData, setChatData] = useState([]); // Use state to hold server posts
    // const [lastMessageId, setLastMessageId] = useState(null);
    // const [lastMessage, setLastMessage] = useState(null);
    const [editedMessage, setEditedMessage] = useState(false);
    const [newMessageText, setNewMessageText] = useState('');

    const {messageTree, addMessage, deleteMessage, initializeOrUpdateTree,} = useChat();

    // const { branch, lastMessage } = getBranchAndLastMessageFromTree();

    // get user and accessToken from AuthProvider
    const {accessToken, user} = React.useContext(AuthContext);

    console.log("params.id", params.chat_id)

    const handleImageUpload = (fileName, imageUrl) => {
        // Update the state with the new image URL
        setImageData(fileName)
        setImageDataUrl(imageUrl)
        // Add the new image URL to the current files like {file1: url1, file2: url2}
        setCurrentFiles({...currentFiles, [fileName]: imageUrl})
    };

    const removeImage = (fileUrlToRemove) => {
        const filteredFiles = Object.entries(currentFiles).reduce((acc, [key, value]) => {
            if (value !== fileUrlToRemove) {
                acc[key] = value;
            }
            return acc;
        }, {});

        setCurrentFiles(filteredFiles);
    };

    const {
        messages,
        startFetching,
        stopFetching
    } = useManualServerSentEvents('http://127.0.0.1:8000/chat_model', {message: messageText});

    // Combine messages and replace '\n\n' with HTML line break '<br /><br />'
    const combinedMessages = useMemo(() => {
        return messages.join('').replace(/\n\n/g, '<br /><br />');
    }, [messages]);

    useEffect(() => {
        console.log("Calling useEffect for get initial chat messages")
        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase
                .from('chat_message')
                .select()
                .eq('chat_id', params.chat_id)

            console.log("data", data);
            console.log("error", error);

            if (data) {
                setChatData(data);
                initializeOrUpdateTree(data);
            }
            if (error) {
                console.error("Error fetching chat messages:", error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log("Calling useEffect for get updated chat messages")
        // console.log("ServerPosts", ServerPosts);

        const channel = supabase.channel('realtime chats')
            .on("postgres_changes", {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_message"
                }, (payload) => {
                    console.log("Insert payload", payload.new);
                    addMessage(payload.new);
                    setNewMessageText('')
                    // setMessages(currentMessages => [...currentMessages, payload.new]);
                    // const rootNode = new MessageNode(payload.new);
                    // setLocalMessageTree(currentTree => [...currentTree, rootNode]);
                }
            )
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_message',
            },  (payload) => {
                console.log("Update payload", payload.new);
                // setMessages(currentMessages => [...currentMessages, payload.new]);
                // const rootNode = new MessageNode(payload.new);
                // setLocalMessageTree(currentTree => [...currentTree, rootNode]);
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'chat_message',
            },  (payload) => {
                console.log("Delete payload", payload.new);
                // setMessages(currentMessages => [...currentMessages, payload.new]);
                // const rootNode = new MessageNode(payload.new);
                // setLocalMessageTree(currentTree => [...currentTree, rootNode]);
            })
            .subscribe();

        return () => {
            console.log("Unsubscribing")
            supabase.removeChannel(channel)
        }
    }, [])

    // const [selectedBranch, setSelectedBranch] = useState<BranchResult | null>(null);

    // useEffect(() => {
    //     // Assuming `messageTree` is available in your `useChat` hook
    //     const result = getBranchAndLastMessageFromTree();
    //     setSelectedBranch(result);
    // }, [getBranchAndLastMessageFromTree]);


    const insertNewIntoSupabase = async () => {
        console.log("Inserting into Supabase")
        console.log("chat_id", params.chat_id)
        console.log("user_id", user.id)
        console.log("text", messageText)
        console.log("version", 1)
        console.log("previous_message_id", lastMessage.message_id)
        // original_message_id -
        const {data, error} = await supabase
            .from('chat_message')
            .insert([
                {
                    chat_id: params.chat_id,
                    user_id: user.id,
                    text: messageText,
                    version: 1,
                    previous_message_id: lastMessage.message_id
                }
            ]);

        if (error) console.error('Error inserting into Supabase:', error);
        else console.log('Inserted into Supabase:', data);
    };

    const handleSendClick = async () => {
        // await startFetching();
        await insertNewIntoSupabase();
    };

    const handleAddClick = () => {

        const newMessage = {
            chat_id: "7e1a0e0e-cb5a-4aac-955a-e1f8c06cfc3a",
            user_id: "89e9b16c-49c3-49a4-88bf-3ccdac429d4f",
            llm_id: null,
            text: newMessageText,
            original_message_id: null,
            version: 1,
            previous_message_id: "937f94b3-d962-415e-8d0f-f985e1435f61",
        };
        addMessage(newMessage);
        setNewMessageText(''); // Clear the input field after adding
    };

    const handleDeleteClick = (messageId) => {
        deleteMessage(messageId);
    };


    if (isLoading) {
        return <div>Loading chat messages...</div>; // Display a loading message or spinner
    }


    return (
        <div className="flex h-screen">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/*<div className="chat-window">*/}
                {/*    <h2>Chat Window for Project {params.id}</h2>*/}
                {/*    {selectedBranch && selectedBranch.branch.length > 0 ? (*/}
                {/*        selectedBranch.branch.map((node, index) => (*/}
                {/*            // Display each message in the selected branch*/}
                {/*            <div key={index}>*/}
                {/*                <MessageComponent node={node}/>*/}
                {/*            </div>*/}
                {/*        ))*/}
                {/*    ) : (*/}
                {/*        <p>No messages to display</p>*/}
                {/*    )}*/}
                {/*</div>*/}

                <div className="chat-window">
                    <h2>Chat Window for Project {params.id}</h2>
                    {console.log("messageTree in ui", messageTree)}
                    {messageTree ? (
                        <MessageComponent node={messageTree}/>
                    ) : (
                        <p>No messages to display</p>
                    )}
                </div>

                <div className="flex-1 flex flex-col">
                    {/* Input for new message text */}
                    <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                    />
                    {/* Button to add a new message */}
                    <button onClick={handleSendClick}>Add Message</button>
                </div>


            </div>
        </div>
    );
}

