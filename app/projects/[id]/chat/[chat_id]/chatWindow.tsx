'use client';

import React, {useMemo, useState} from 'react';
import {useEffect} from 'react';
import Image from "next/image";
import Sidebar from "@/app/projects/[id]/sideBar";
import NewFiles from "@/app/projects/[id]/files/addFiles";
import AddFilesIcon from "@/app/projects/[id]/chat/addFilesIcon";
import ChatComponent from "@/app/projects/[id]/chat/[chat_id]/chatStream";
import {useManualServerSentEvents} from "@/hooks/useManualServerSentEvents";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import RealTimeM from "@/app/projects/[id]/chat/[chat_id]/test/RealTimeM";
import {usePathname} from "next/navigation";

interface ChatMessage {
    id: string; // Unique identifier for each message
    type: 'user' | 'ai'; // Distinguish between user and AI messages
    senderId: string; // ID of the sender (user or AI)
    text: string; // The message text
}

interface Sender {
    id: string; // Unique identifier for the sender
    name: string; // Display name of the sender
    avatar: string; // URL to the sender's avatar (optional)
}

interface ChatWindowProps {
    messages: ChatMessage[]; // Array of chat messages
    senders: Sender[]; // Array of chat participants
}

const senders: Sender[] = [
    {id: 'user1', name: 'John Doe', avatar: '/profile_image.png'}, // Sample user
    {id: 'user2', name: 'timnirmal', avatar: '/profile_image.png'}, // Sample user
    {id: 'ai1', name: 'ChatGPT', avatar: '/open_ai.png'}, // Sample AI
    // Add more users and AIs as needed
];

const messages_demo: ChatMessage[] = [
    {id: 'msg1', type: 'user', senderId: 'user1', text: 'Hello, AI!'},
    {id: 'msg2', type: 'ai', senderId: 'ai1', text: 'Hello, John! How can I assist you today?'},
    {id: 'msg3', type: 'user', senderId: 'user2', text: "Hello, AI! I'm timnirmal. Can tell me about your features?"},
];

// Define a message tree node
class MessageNode {
    constructor(data) {
        this.data = data; // the message data itself
        this.replies = []; // children messages (branches)
        this.versions = []; // different versions of this message
    }

    addReply(message) {
        this.replies.push(new MessageNode(message));
    }

    addVersion(message) {
        this.versions.push(message);
    }
}


export default function ChatWindow({params}: { params: { id: string } }) {
    const [imageData, setImageData] = useState(null);
    const [imageDataUrl, setImageDataUrl] = useState(null);
    const [currentFiles, setCurrentFiles] = useState({});
    const [messageText, setMessageText] = useState("")
    const supabase = createClientComponentClient<Database>();
    // const [serverPosts, setServerPosts] = useState([]); // Use state to hold server posts
    const [isLoading, setIsLoading] = useState(true);
    const [messageTree, setMessageTree] = useState([]);

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
        console.log("Calling useEffect in chatWindow.tsx")
        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase
                .from('chat_message')
                .select()
                .eq('chat_id', params.chat_id)

            console.log("data", data);
            console.log("error", error);

            if (data) {
                // setServerPosts(data);
                constructMessageTree(data);
            }
            if (error) {
                console.error("Error fetching chat messages:", error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const constructMessageTree = (messages) => {
        const messageMap = new Map();
        messages.forEach((msg) => {
            messageMap.set(msg.message_id, new MessageNode(msg));
        });

        // Build the tree
        const rootMessages = [];
        messages.forEach((msg) => {
            const node = messageMap.get(msg.message_id);
            if (msg.previous_message_id) {
                const parentNode = messageMap.get(msg.previous_message_id);
                parentNode.addReply(node);
            } else {
                rootMessages.push(node);
            }
            if (msg.version_number) {
                const parentNode = messageMap.get(msg.previous_message_id);
                parentNode.addVersion(node);
            }
        });

        console.log("rootMessages", rootMessages);


        setMessageTree(rootMessages);
    };

    // if (isLoading) {
    //     return <div>Loading chat messages...</div>; // Display a loading message or spinner
    // }


    return (
        <div className="flex h-screen">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="container mx-auto px-4">
                    {/*<ChatComponent/>*/}
                </div>

                {messageTree && messageTree.length > 0 ? (
                    <RealTimeM messageTree={messageTree} combinedMessages={combinedMessages} />
                ) : isLoading ? (
                    <div>Loading chat messages...</div>
                ) : (
                    <div>No chat messages found</div>
                )}
                {/*/!*<ChatComponent/>*!/*/}
                {/*<div className="mt-4 p-2 bg-gray-100 rounded shadow"*/}
                {/*     dangerouslySetInnerHTML={{__html: combinedMessages}}/>*/}

                {/*Chat Messages Area*/}
                <div className="p-5 bg-gray-100 overflow-hidden">
                    {/*show image image list, name with url*/}
                    <div className="p-5 bg-gray-300 mb-4 rounded-2xl flex flex-wrap">
                        {Object.entries(currentFiles).map(([key, fileUrl]) => (
                            <div key={key} className="relative flex items-center space-x-2 m-2">
                                <div className="text-sm whitespace-normal break-words max-w-full">
                                    <strong>Key:</strong> {key}
                                </div>
                                <div className="text-sm whitespace-normal break-words max-w-full">
                                    <strong>Value:</strong> {fileUrl}
                                </div>
                            </div>
                        ))}
                        {/* Ensure the text doesn't overflow */}
                        <p className="break-words whitespace-normal max-w-full"> {messageText} </p>
                    </div>
                </div>

                {/*<button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"*/}
                {/*        onClick={handleFileChange}*/}
                {/*>*/}
                {/*    Send*/}
                {/*</button>*/}


                {/* Input area */}
                <div className="p-5 bg-gray-100">
                    <div className="p-5 bg-gray-300 mb-4 rounded-2xl flex flex-wrap">
                        {Object.values(currentFiles).map((fileUrl) => (
                            <div key={fileUrl} className="relative flex items-center space-x-2 m-2">
                                <img src={fileUrl} alt={`file`} className="w-24 h-24 object-cover"/>
                                <button
                                    className="absolute top-0 right-0 text-sm bg-gray-500 text-gray-900 p-1 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"
                                    onClick={() => removeImage(fileUrl)}>X
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 items-center">
                        {/*<NewFiles pageId={params.id} mode="icon"/>*/}
                        <AddFilesIcon pageId={params.id} onUploadSuccess={handleImageUpload}/>
                        <input type="text" className="flex-1 p-2 rounded border border-gray-300"
                               placeholder="Type a message..." onChange={(e) => setMessageText(e.target.value)}/>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                                onClick={startFetching}
                        >
                            Send
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
