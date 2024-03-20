import React, {useState, useEffect} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {usePathname} from "next/navigation";
// import useUserDataCache from "@/hooks/useUserDataCache";
// import RenderMessageNode from './RenderMessageNode';

const CommentModal = ({ isOpen, onClose, messageData, onSendComment }) => {
    const [comment, setComment] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg max-w-lg w-full">
                <div className="mb-2">
                    {/* Display the message content here */}
                    <div dangerouslySetInnerHTML={{__html: messageData.text}} />
                </div>
                <textarea
                    className="border p-2 w-full"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => {
                            onSendComment(comment);
                            setComment("");
                        }}
                    >
                        Send
                    </button>
                    <button
                        className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const RenderMessageNode = ({node, versionIndex, showPreviousVersion, showNextVersion, userDetails, llmDetails}) => {
    const currentVersionNode = versionIndex === -1 ? node : node.versions[versionIndex];
    const currentMessageData = currentVersionNode.data;
    const [comment, setComment] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    // console.log("In message render node", userDetails, llmDetails, currentMessageData);
    const supabase = createClientComponentClient<Database>();

    // Find the user or llm name by ID
    let senderName: any = "";
    if (currentMessageData.user_id) {
        // console.log('userDetails', userDetails);
        senderName = userDetails.find((user) => user.id === currentMessageData.user_id)?.username;
    } else {
        // console.log('llmDetails', llmDetails);
        senderName = llmDetails.find((llm) => llm.llm_id === currentMessageData.llm_id)?.name;
        // console.log('senderName', senderName);
    }

    const pathname = usePathname();
    const chatId = pathname.split('/')[4];

    // Placeholder function for copy to clipboard functionality
    const handleCopy = () => {
        navigator.clipboard.writeText(currentMessageData.text);
    };

    // Placeholder function for regenerate. Implement according to your needs.
    const handleRegenerate = () => {
        console.log("Regenerate functionality not implemented.");
    };

    // Placeholder functions for like, dislike, and comment
    const handleLike = async () => {
        console.log("Send like to database");
        // send to supabase
        const { data, error } = await supabase
            .from('feedback')
            .insert([
                { message_id: currentMessageData.message_id, user_id: userDetails[0].id, chat_id: chatId, like: true }
            ]);

        if (error) {
            console.error('Error loading data', error);
            return;
        }

        if (data) {
            console.log("data", data);
        }
    };

    const handleDislike = async () => {
        console.log("Send dislike to database");
        const { data, error } = await supabase
            .from('feedback')
            .insert([
                { message_id: currentMessageData.message_id, user_id: userDetails[0].id, chat_id: chatId, like: false }
            ]);

        if (error) {
            console.error('Error loading data', error);
            return;
        }

        if (data) {
            console.log("data", data);
        }
    };

    const handleComment = async () => {
        console.log("Handle comment functionality");
        setIsModalOpen(true);

    };

    const onSendComment = async (comment) => {
        console.log("Sending comment to database:", comment);
        const { data, error } = await supabase
            .from('feedback')
            .insert([
                { message_id: currentMessageData.message_id, user_id: userDetails[0].id, chat_id: chatId, comment: comment }
            ]);

        if (error) {
            console.error('Error loading data', error);
            return;
        }

        if (data) {
            console.log("data", data);
        }

        setComment("");
        setIsModalOpen(false); // Close the modal after sending the comment
    };


    const handleDelete = async () => {
        console.log("Handle delete functionality");
        const { data, error } = await supabase
            .from('chat_message')
            .delete()
            .eq('message_id', currentMessageData.message_id);

        if (error) {
            console.error('Error loading data', error);
            return;
        }

        if (data) {
            console.log("data", data);
        }
    };

    const handleEdit = async () => {
        console.log("Handle edit functionality");
        // const { data, error } = await supabase
        //     .from('messages')
        //     .update({ text: currentMessageData.text })
        //     .eq('message_id', currentMessageData.message_id);
        //
        // if (error) {
        //     console.error('Error loading data', error);
        //     return;
        // }
        //
        // if (data) {
        //     console.log("data", data);
        // }
    };



    const buttonStyle = "w-4 h-4";

    return (
        <div key={currentMessageData.message_id} className="flex items-start space-x-2 mb-4">
            <img src={'/profile_image.png'} alt={senderName} className="w-10 h-10 rounded-full object-cover"/>
            <div
                className={`flex flex-col rounded ${currentMessageData.user_id ? 'bg-blue-100' : 'bg-green-100'} p-2`}>
                <div className="font-bold">{senderName}</div>
                <div className="stream-content" dangerouslySetInnerHTML={{__html: currentMessageData.text}}/>
                {/*<div>{currentMessageData.text}</div>*/}
                {/*<div>Message ID: {currentMessageData.message_id}</div>*/}
                {/* Version Navigation */}
                {node.versions && node.versions.length > 1 && (
                    <div className="flex items-center space-x-3">
                        <button onClick={showPreviousVersion} disabled={versionIndex === -1}
                                className="bg-gray-300 p-1">
                            &lt; Prev
                        </button>
                        <span>Version {versionIndex + 2} of {node.versions.length + 1}</span>
                        <button onClick={showNextVersion} disabled={versionIndex >= node.versions.length - 1}
                                className="bg-gray-300 p-1">
                            Next &gt;
                        </button>
                    </div>
                )}
                <div className="flex justify-start space-x-2 mt-2">
                    <button onClick={handleCopy} title="Copy">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className={buttonStyle}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/>
                        </svg>
                    </button>
                    <button onClick={handleRegenerate} title="Regenerate">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className={buttonStyle}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                        </svg>
                    </button>
                    <button onClick={handleEdit} title="Regenerate">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className={buttonStyle}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                        </svg>
                    </button>
                    <button onClick={handleLike} title="Like">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className={buttonStyle}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"/>
                        </svg>
                    </button>
                    <button onClick={handleDislike} title="Dislike">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className={buttonStyle}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54"/>
                        </svg>
                    </button>
                    <button onClick={handleComment} title="Comment">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className={buttonStyle}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/>
                        </svg>
                    </button>
                    <button onClick={handleDelete} title="Comment">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className={buttonStyle}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                        </svg>
                    </button>
                    <CommentModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        messageData={currentMessageData} // Make sure you have access to the current message data
                        onSendComment={onSendComment}
                    />
                    <div className="text-sm">{new Date(currentMessageData.created_date).toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
};


const MessageComponent = ({
                              node,
                              currentMessage,
                              doesStateChange,
                              lastMessageRef,
                              setCurrentMessage,
                              setDoesStateChange,
                              userDetails,
                              llmDetails
                          }) => {
    const [versionIndex, setVersionIndex] = useState(-1);

    const showNextVersion = () => {
        setVersionIndex((prevIndex) => (prevIndex < node.versions.length - 1 ? prevIndex + 1 : prevIndex));
        setDoesStateChange(true);
    };

    const showPreviousVersion = () => {
        setVersionIndex((prevIndex) => (prevIndex > -1 ? prevIndex - 1 : prevIndex));
        setDoesStateChange(true);
    };

    const currentVersionNode = versionIndex === -1 ? node : node.versions[versionIndex];
    const currentMessageData = currentVersionNode.data;

    useEffect(() => {
        setCurrentMessage(currentMessageData);
    }, [currentMessageData, setCurrentMessage]);

    useEffect(() => {
        lastMessageRef.current = currentMessageData;
    }, [currentMessageData, lastMessageRef]);

    return (
        <div>
        <RenderMessageNode
                node={node}
                versionIndex={versionIndex}
                showPreviousVersion={showPreviousVersion}
                showNextVersion={showNextVersion}
                userDetails={userDetails}
                llmDetails={llmDetails}
            />
            {/* Recursively render child messages */}
            {currentVersionNode.children && currentVersionNode.children.map((childNode) => (
                <MessageComponent
                    key={childNode.data.message_id}
                    node={childNode}
                    lastMessageRef={lastMessageRef}
                    setCurrentMessage={setCurrentMessage}
                    setDoesStateChange={setDoesStateChange}
                    doesStateChange={doesStateChange}
                    currentMessage={currentMessage}
                    userDetails={userDetails}
                    llmDetails={llmDetails}
                />
            ))}
        </div>
    );
};

export default MessageComponent;
