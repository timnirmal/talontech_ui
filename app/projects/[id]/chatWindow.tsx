import React from 'react';
import Image from "next/image";

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


export default function ChatWindow({ params }: { params: { id: string } }) {
    const getMessageSender = (senderId: string): Sender | undefined => {
        return senders.find(sender => sender.id === senderId);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-800 text-white">
                <div className="p-5">Chat List</div>
                {/* List of chats */}
                <ul className="overflow-auto">
                    {/* Placeholder for chat list items */}
                    <li className="p-2 hover:bg-gray-700 cursor-pointer">Chat 1</li>
                    <li className="p-2 hover:bg-gray-700 cursor-pointer">Chat 2</li>
                </ul>
                <div className="mt-auto p-5">Settings</div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat messages area */}
                <div className="flex-1 p-5 overflow-auto">
                    {messages.map((message) => {
                        const sender = getMessageSender(message.senderId);
                        return (
                            <div key={message.id} className="flex items-start space-x-2 mb-4">
                                {/* Sender Avatar */}
                                <img src={sender?.avatar || '/default-avatar.png'} alt={sender?.name}
                                     className="w-10 h-10 rounded-full object-cover"/>

                                {/* Message Text and Sender's Name */}
                                <div
                                    className={`flex flex-col rounded max-w-xs ${message.type === 'user' ? 'bg-blue-100' : 'bg-green-100'} p-2`}>
                                    <div className="font-bold">{sender?.name}</div>
                                    <div>{message.text}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input area */}
                <div className="p-5 bg-gray-100">
                    <div className="flex gap-2">
                        <input type="text" className="flex-1 p-2 rounded border border-gray-300"
                               placeholder="Type a message..."/>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
