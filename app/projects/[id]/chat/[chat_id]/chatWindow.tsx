'use client';

import React, {useEffect, useMemo, useState} from 'react';
import AddFilesIcon from "@/app/projects/[id]/chat/addFilesIcon";
import {useManualServerSentEvents} from "@/hooks/useManualServerSentEvents";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import RealTimeM from "@/app/projects/[id]/chat/[chat_id]/test/RealTimeM";
import ChatComponent from "@/app/projects/[id]/chat/[chat_id]/messageNode";
import ChatStream from "@/app/projects/[id]/chat/[chat_id]/chatStream";
// import MessageViewerComponent from "@/app/projects/[id]/chat/[chat_id]/MessageTreeComponent";

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


export default function ChatWindow({params}: { params: { id: string } }) {
    const [imageData, setImageData] = useState(null);
    const [imageDataUrl, setImageDataUrl] = useState(null);
    const [currentFiles, setCurrentFiles] = useState({});
    const [messageText, setMessageText] = useState("")
    const supabase = createClientComponentClient<Database>();
    // const [serverPosts, setServerPosts] = useState([]); // Use state to hold server posts
    const [isLoading, setIsLoading] = useState(true);
    const [messageTree, setMessageTree] = useState([]);
    const [chatData, setChatData] = useState([]); // Use state to hold server posts

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
                // constructMessageTree(data);
                setChatData(data);
            }
            if (error) {
                console.error("Error fetching chat messages:", error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);


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

                <ChatComponent data={chatData} stream={combinedMessages}/>
                {/*<ChatStream/>*/}


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

                {/*<div className="mt-4 p-2 bg-gray-100 rounded shadow"*/}
                {/*     dangerouslySetInnerHTML={{__html: combinedMessages}}/>*/}


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
