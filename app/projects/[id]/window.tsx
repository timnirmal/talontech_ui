'use client';

import React, {useState} from 'react';
import Image from "next/image";
import Sidebar from "@/app/projects/[id]/sideBar";
import ChatWindowStarter from "@/app/projects/[id]/chatWindowStarter";

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
    { id: 'user1', name: 'John Doe', avatar: '/profile_image.png' }, // Sample user
    { id: 'user2', name: 'timnirmal', avatar: '/profile_image.png' }, // Sample user
    { id: 'ai1', name: 'ChatGPT', avatar: '/open_ai.png' }, // Sample AI
    // Add more users and AIs as needed
];

const messages: ChatMessage[] = [
    { id: 'msg1', type: 'user', senderId: 'user1', text: 'Hello, AI!' },
    { id: 'msg2', type: 'ai', senderId: 'ai1', text: 'Hello, John! How can I assist you today?' },
    { id: 'msg3', type: 'user', senderId: 'user2', text: "Hello, AI! I'm timnirmal. Can tell me about your features?" },
    // More messages...
];


export default function Window({ params }: { params: { id: string } }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to manage sidebar visibility

    // Function to toggle sidebar visibility
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const getMessageSender = (senderId: string): Sender | undefined => {
        return senders.find(sender => sender.id === senderId);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            {/*<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeProjectId={params.id}/>*/}
            {/*<Sidebar/>*/}

            {/* Chat Area */}
            <ChatWindowStarter params={params}/>
        </div>
    );
}
