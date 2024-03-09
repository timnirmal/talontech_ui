'use client';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import AddFilesIcon from "@/app/projects/[id]/chat/addFilesIcon";
import {useManualServerSentEvents} from "@/hooks/useManualServerSentEvents";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import RealTimeM from "@/app/projects/[id]/chat/[chat_id]/test/RealTimeM";
import ChatComponent from "@/app/projects/[id]/chat/[chat_id]/ChatOperations";
import ChatStream from "@/app/projects/[id]/chat/[chat_id]/chatStream";
import {AuthContext} from "@/components/AuthProvider";
import {useChat} from './ChatContext';
import {MessageNode} from "@/app/projects/[id]/chat/[chat_id]/messageNode";

interface MessageComponentProps {
    node: MessageNode;
    lastMessageRef: React.RefObject<any>;
    currentMessage: any; // Define more specific type based on your project
    setCurrentMessage: React.Dispatch<React.SetStateAction<any>>; // Define more specific type
    doesStateChange: boolean;
    setDoesStateChange: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ChatWindowProps {
    params: {
        id: string;
        chat_id?: string; // Assuming chat_id might be part of params based on your usage
    };
}


const MessageComponent = ({
                              node,
                              lastMessageRef,
                              currentMessage,
                              setCurrentMessage,
                              doesStateChange,
                              setDoesStateChange
                          }: MessageComponentProps) => {
    // State to track the index of the current version being displayed.
    const [versionIndex, setVersionIndex] = useState(-1);


    // Helper to get the node (version or base) currently being displayed.
    const getCurrentVersionNode = () => {
        if (versionIndex === -1) {
            return node; // The base node itself
        } else {
            return node.versions[versionIndex]; // A specific version
        }
    };

    const currentVersionNode = getCurrentVersionNode();
    const currentMessageData = currentVersionNode.data;

    // Navigate to the next or previous version
    const showNextVersion = () => {
        setVersionIndex((prevIndex) => (prevIndex < node.versions.length - 1 ? prevIndex + 1 : prevIndex));
        setDoesStateChange(true);
    };

    const showPreviousVersion = () => {
        setVersionIndex((prevIndex) => (prevIndex > -1 ? prevIndex - 1 : prevIndex));
        setDoesStateChange(true);
    };

    const childrenToDisplay = currentVersionNode.children || node.children;

    // when currentMessageData changes, update the currentMessage state
    useEffect(() => {
        setCurrentMessage(currentMessageData);
    }, [currentMessageData]);

    useEffect(() => {
        lastMessageRef.current = currentMessageData;
    }, [currentMessageData, lastMessageRef]);

    return (
        <div>
            <br/>
            <div>Version: {currentVersionNode.currentVersion}</div>
            <div>Message: {currentMessageData.text}</div>
            <div>Message ID: {currentMessageData.message_id}</div>
            {node.versions.length > 0 && (
                <div>
                    <button className="bg-gray-300 p-1 mr-3"
                            onClick={showPreviousVersion} disabled={versionIndex === -1}>
                        &lt; Prev
                    </button>
                    <span>
            Version {versionIndex + 2} of {node.versions.length + 1}
          </span>
                    <button className="bg-gray-300 p-1 ml-3"
                            onClick={showNextVersion} disabled={versionIndex >= node.versions.length - 1}>
                        Next &gt;
                    </button>
                </div>
            )}
            {/* Render children for the current version */}
            {childrenToDisplay.length > 0 && (
                <div className="children">
                    {childrenToDisplay.map((childNode) => (
                        <MessageComponent key={childNode.data.message_id}
                                          node={childNode}
                                          lastMessageRef={lastMessageRef}
                                          currentMessage={currentMessage}
                                          setCurrentMessage={setCurrentMessage}
                                          doesStateChange={doesStateChange}
                                          setDoesStateChange={setDoesStateChange}
                        />
                    ))}
                </div>
            )}
            <button>sdsdsd</button>
        </div>
    );
};

export default function ChatWindow({params}: ChatWindowProps) {
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

    const [lastMessage, setLastMessage] = useState(null);
    const [currentMessage, setCurrentMessage] = useState(null);
    const lastMessageRef = useRef();
    const [doesStateChange, setDoesStateChange] = useState(false);
    const [realLastMessage, setRealLastMessage] = useState(null);

    const {messageTree, addMessage, deleteMessage, initializeOrUpdateTree} = useChat();

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
            }, (payload) => {
                console.log("Update payload", payload.new);
                // setMessages(currentMessages => [...currentMessages, payload.new]);
                // const rootNode = new MessageNode(payload.new);
                // setLocalMessageTree(currentTree => [...currentTree, rootNode]);
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'chat_message',
            }, (payload) => {
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

    useEffect(() => {
        if (lastMessageRef.current) {
            setCurrentMessage(lastMessageRef.current);
        }
    }, [lastMessageRef.current]);

    const lastMessageMemo = useMemo(() => {
        // Function to find the last message in your tree
        // This needs to be adapted based on your actual data structure and criteria for the "last" message
        let findLastMessage = (node) => {
            if (!node?.children || node?.children.length === 0) {
                return node?.data; // Assuming 'data' contains the message details
            }
            // Recursively find the last message in the last child
            return findLastMessage(node.children[node.children.length - 1]);
        };

        // Assuming 'messageTree' is your tree data structure
        return findLastMessage(messageTree);
    }, [messageTree]);

    useEffect(() => {
        if (lastMessageMemo) {
            setLastMessage(lastMessageMemo);
        }
    }, [lastMessageMemo]);

    // if (!doesStateChange) {
    //     setRealLastMessage(lastMessageRef.current)
    // }else {
    //     setRealLastMessage(lastMessage)
    // }

    useEffect(() => {
        // console.log("lastMessageRef.current", lastMessageRef.current);  // after that this is right
        // console.log("lastMessage", lastMessage); // at first render, lastMessage is right
        if (doesStateChange) {
            setRealLastMessage(lastMessageRef.current)
        }
        else {
            setRealLastMessage(lastMessage)
        }
    }, [lastMessageRef.current,lastMessage, doesStateChange, realLastMessage])



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

    const updateCurrentMessage = (messageData) => {
        // console.log("updateCurrentMessage", messageData);
        setCurrentMessage(messageData);
    };

    const updateDoesStateChange = () => {
        setDoesStateChange(true);
    }




    return (
        <div className="flex h-screen">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">


                <div className="chat-window">
                    <h2>Chat Window for Project {params.id}</h2>
                    {/*{console.log("messageTree in ui", messageTree)}*/}
                    {messageTree ? (
                        <MessageComponent node={messageTree}
                                          currentMessage={currentMessage}
                                          lastMessageRef={lastMessageRef}
                                          setCurrentMessage={updateCurrentMessage}
                                          doesStateChange={doesStateChange}
                                          setDoesStateChange={updateDoesStateChange}
                        />
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

                {/*<div>currentMessage: {currentMessage?.text}</div>*/}
                {/*<div>currentMessage: {lastMessageRef.current?.text}</div>*/}
                {/*<div>lastMessage: {lastMessage?.text}</div>*/}
                <div>Real lastMessage: {realLastMessage?.text}</div>
                {/*{doesStateChange ?*/}
                {/*    <div>State Changed</div>*/}
                {/*    :*/}
                {/*    <div>State Not Changed</div>*/}
                {/*}*/}
            </div>
        </div>
    );
}


// https://chat.openai.com/c/9346606b-564e-4313-bb47-5fee9b99759b
