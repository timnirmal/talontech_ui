'use client';

import React, {useState} from 'react';
import AddFilesIcon from "@/app/projects/[id]/chat/addFilesIcon";
import {useRouter} from 'next/navigation';

export default function ChatWindowStarter({params}: { params: { id: string } }) {
    const router = useRouter();

    const [currentFiles, setCurrentFiles] = useState({});
    const [messageText, setMessageText] = useState("")

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

            router.push(`/projects/${params.id}/chat/${chat_id}`)
        } else {
            console.error('File upload failed with status', response.status);
        }
    };

    function handleMessageSend() {
        // create new chat, chat message, attach files
        // redirect to chat window

        // call uploadFile
        uploadFile();

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
