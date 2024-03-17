'use client';

import React, {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';

export default function NewChatButton({params}) {
    const router = useRouter();
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [newName, setNewName] = useState('');


    const createChatInstance = async () => {
        console.log('In NewChatButton', params.activeProjectId);
        if (params.activeProjectId === undefined) {
            console.error('params.id is undefined');
            return;
        }
        // console.log('uploadFile', file);
        const formData = new FormData();
        // formData.append('file', file);
        formData.append('title', 'title');
        formData.append('description', 'description');
        formData.append('project_id', params.activeProjectId);
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

            router.push(`/projects/${params.activeProjectId}/chat/${chat_id}`)

            return chat_id
        } else {
            console.error('File upload failed with status', response.status);
        }
    };


    return (
        <button className="" onClick={createChatInstance}>
            <div className="flex items-center space-x-2 cursor-pointer">
                {/* Replace "div" with your actual icon component */}
                {/*<div className="w-6 h-6 bg-gray-500"></div>*/}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                     className="icon-md">
                    <path fillRule="evenodd" clipRule="evenodd"
                          d="M16.7929 2.79289C18.0118 1.57394 19.9882 1.57394 21.2071 2.79289C22.4261 4.01184 22.4261 5.98815 21.2071 7.20711L12.7071 15.7071C12.5196 15.8946 12.2652 16 12 16H9C8.44772 16 8 15.5523 8 15V12C8 11.7348 8.10536 11.4804 8.29289 11.2929L16.7929 2.79289ZM19.7929 4.20711C19.355 3.7692 18.645 3.7692 18.2071 4.2071L10 12.4142V14H11.5858L19.7929 5.79289C20.2308 5.35499 20.2308 4.64501 19.7929 4.20711ZM6 5C5.44772 5 5 5.44771 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V14C19 13.4477 19.4477 13 20 13C20.5523 13 21 13.4477 21 14V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6C3 4.34314 4.34315 3 6 3H10C10.5523 3 11 3.44771 11 4C11 4.55228 10.5523 5 10 5H6Z"
                          fill="currentColor" data-darkreader-inline-fill=""
                        // style="--darkreader-inline-fill: currentColor;"
                    >
                    </path>
                </svg>
                <span>New Chat</span>
            </div>
        </button>
    );
}
