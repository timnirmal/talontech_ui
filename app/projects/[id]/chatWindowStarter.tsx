'use client';

import React, {useMemo, useState} from 'react';
import AddFilesIcon from "@/app/projects/[id]/chat/addFilesIcon";
import {useRouter} from 'next/navigation';
import {AuthContext} from "@/components/AuthProvider";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {useManualServerSentEvents} from "@/hooks/useManualServerSentEvents";

export default function ChatWindowStarter({params}: { params: { id: string } }) {
    const router = useRouter();

    const [currentFiles, setCurrentFiles] = useState({});
    const [messageText, setMessageText] = useState("")
    const supabase = createClientComponentClient<Database>();

    const handleImageUpload = (fileName, imageUrl) => {
        // Update the state with the new image URL
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

    const uploadFile = async () => {
        // console.log('uploadFile', file);
        const formData = new FormData();
        // formData.append('file', file);
        formData.append('title', 'title');
        formData.append('description', 'description');
        // formData.append('pageId', pageId);
        // for (let [key, value] of formData.entries()) {
        //     console.log(key, value);
        // }

        // Make an API request to your server-side endpoint
        const response = await fetch('/api/chatstarter', {
            method: 'POST',
            body: formData,
        });

        // Handle the response from the server
        if (response.ok) {
            console.log('File uploaded successfully', response.status);
            const data = await response.json();
            const chat_id = data.chat_id;
            // console.log("chat_id", data.data)
            // const fileName = data.filename;
            // setImages(imageUrl);

            // console.log("params.id", params.id)
            // console.log("chat_id", chat_id)
            // // redirect to chat window
            // const urltopush = `/projects/${params.id}/chat/${chat_id}`
            // console.log("urltopush", urltopush)

            // router.push(`/projects/${params.id}/chat/${chat_id}`)

            return chat_id
        } else {
            console.error('File upload failed with status', response.status);
        }
    };

    const {accessToken, user} = React.useContext(AuthContext);

    const insertNewIntoSupabase = async (chat_id) => {
        console.log("Inserting into Supabase")
        console.log("chat_id", chat_id)
        console.log("user_id", user.id)
        console.log("text", messageText)
        console.log("version", 1)
        // console.log("previous_message_id", lastMessage.message_id)
        // original_message_id -
        const {data, error} = await supabase
            .from('chat_message')
            .insert([
                {
                    chat_id: chat_id,
                    user_id: user.id,
                    text: messageText,
                    version: 1,
                    // previous_message_id: realLastMessage?.message_id
                }
            ]);

        if (error) console.error('Error inserting into Supabase:', error);
        else console.log('Inserted into Supabase:', data);
    };

    const {
        messages,
        startFetching,
        stopFetching
    } = useManualServerSentEvents('http://127.0.0.1:8000/chat_model', {message: newMessageText});

    // Combine messages and replace '\n\n' with HTML line break '<br /><br />'
    const combinedMessages = useMemo(() => {
        setLLMMessage(messages.join('').replace(/\n\n/g, '<br /><br />'));
        return messages.join('').replace(/\n\n/g, '<br /><br />');
    }, [messages]);

    async function handleMessageSend() {
        // create new chat, chat message, attach files
        // redirect to chat window

        const chat_id = await uploadFile();
        console.log("chat_id", chat_id)
        await insertNewIntoSupabase(chat_id);

        await startFetching();
        console.log("Start fetching Done");
        // get LLM response from localStorage
        const llmResponseString = localStorage.getItem('llmResponse');
        const llmResponse = JSON.parse(llmResponseString);
        if (llmResponse !== "") {
            await insertNewLLMResponseIntoSupabase(llmResponse);
            setLLMMessage("")
            // clear localStorage
            localStorage.removeItem('llmResponse');
        }

    }

    return (
        <div className="flex h-screen">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat messages area */}
                <div className="flex-1 p-5 overflow-auto">
                </div>

                {/*/!*Chat Messages Area*!/*/}
                {/*<div className="p-5 bg-gray-100 overflow-hidden">*/}
                {/*    /!*show image image list, name with url*!/*/}
                {/*    <div className="p-5 bg-gray-300 mb-4 rounded-2xl flex flex-wrap">*/}
                {/*        {Object.entries(currentFiles).map(([key, fileUrl]) => (*/}
                {/*            <div key={key} className="relative flex items-center space-x-2 m-2">*/}
                {/*                <div className="text-sm whitespace-normal break-words max-w-full">*/}
                {/*                    <strong>Key:</strong> {key}*/}
                {/*                </div>*/}
                {/*                <div className="text-sm whitespace-normal break-words max-w-full">*/}
                {/*                    <strong>Value:</strong> {fileUrl}*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        ))}*/}
                {/*        /!* Ensure the text doesn't overflow *!/*/}
                {/*        <p className="break-words whitespace-normal max-w-full"> {messageText} </p>*/}
                {/*    </div>*/}
                {/*</div>*/}


                {/* Input area */}
                {/* Input area */}

                <div className="p-5 bg-gray-100">
                    {currentFiles && Object.keys(currentFiles).length > 0 && (
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
                    )}
                    <div className="flex gap-2 items-center">
                        {/*<NewFiles pageId={params.id} mode="icon"/>*/}
                        <AddFilesIcon pageId={params.id} onUploadSuccess={handleImageUpload}/>
                        <input type="text" className="flex-1 p-2 rounded border border-gray-300"
                               placeholder="Type a message..." onChange={(e) => setMessageText(e.target.value)}/>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                                onClick={handleMessageSend}
                            // create new chat, chat message, attach files
                            // redirect to chat window
                        >
                            Send
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
