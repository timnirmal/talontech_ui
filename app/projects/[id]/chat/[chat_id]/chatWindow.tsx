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
import {useRouter} from "next/navigation";

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

interface LLMProps {
    llm_id: string;
    name: string;
    version: string;
}

// create sample LLM with LLMProps
const pickedLLM: LLMProps = {
    llm_id: "8db18f56-772b-4275-8316-a127a0617f45",
    name: "Test gpt-4-turbo-preview",
    version: "1"
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
    const [editedMessage, setEditedMessage] = useState(false);
    const [newMessageText, setNewMessageText] = useState('');

    const [lastMessage, setLastMessage] = useState(null);
    const [currentMessage, setCurrentMessage] = useState(null);
    const lastMessageRef = useRef();
    const [doesStateChange, setDoesStateChange] = useState(false);
    const [realLastMessage, setRealLastMessage] = useState(null);

    // create sample LLM with LLMProps
    const [pickedLLM, setPickedLLM] = useState<LLMProps | null>(null);
    const [llmMessage, setLLMMessage] = useState<string>("");
    const [markAnswered, setMarkAnswered] = useState<boolean>(false);


    const {messageTree, addMessage, deleteMessage, initializeOrUpdateTree} = useChat();

    const router = useRouter();

    // const { branch, lastMessage } = getBranchAndLastMessageFromTree();

    // get user and accessToken from AuthProvider
    const {accessToken, user} = React.useContext(AuthContext);

    // console.log("params.id", params.chat_id)

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
    } = useManualServerSentEvents('http://127.0.0.1:8000/chat_model', {message: newMessageText});

    // Combine messages and replace '\n\n' with HTML line break '<br /><br />'
    const combinedMessages = useMemo(() => {
        setLLMMessage(messages.join('').replace(/\n\n/g, '<br /><br />'));
        return messages.join('').replace(/\n\n/g, '<br /><br />');
    }, [messages]);

    useEffect(() => {
        // console.log(llmMessage);
        const llmResponseString = JSON.stringify(llmMessage);
        localStorage.setItem('llmResponse', llmResponseString);
    }, [llmMessage]);

    useEffect(() => {
        // set realLastMessage in localStorage
        const realLastMessageString = JSON.stringify(realLastMessage);
        localStorage.setItem('realLastMessage', realLastMessageString);
    }, [realLastMessage, llmMessage, currentMessage, lastMessageRef, doesStateChange]);

    useEffect(() => {
        console.log("Calling useEffect for get initial chat messages")
        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase
                .from('chat_message')
                .select()
                .eq('chat_id', params.chat_id)

            // console.log("data", data);
            // console.log("error", error);

            if (data) {
                if (data.length > 0) {
                    // console.log("Data length", data.length);
                    setChatData(data);
                    initializeOrUpdateTree(data);
                }
            }
            if (error) {
                console.error("Error fetching chat messages:", error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [markAnswered]);

    useEffect(() => {
        console.log("Calling useEffect for get updated chat messages")
        // console.log("ServerPosts", ServerPosts);

        if (messageTree) {
            const channel = supabase.channel('realtime chats')
                .on("postgres_changes", {
                        event: "INSERT",
                        schema: "public",
                        table: "chat_message"
                    }, (payload) => {
                        console.log("Insert payload", payload.new);
                        addMessage(payload.new);
                        setRealLastMessage(payload.new)
                        setNewMessageText('')
                    }
                )
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'chat_message',
                }, (payload) => {
                    console.log("Update payload", payload.new);
                })
                .on('postgres_changes', {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'chat_message',
                }, (payload) => {
                    console.log("Delete payload", payload.new);
                })
                .subscribe();

            return () => {
                console.log("Unsubscribing")
                supabase.removeChannel(channel)
            }
        }
    }, [messageTree, addMessage])

    useEffect(() => {
        if (lastMessageRef.current) {
            setCurrentMessage(lastMessageRef.current);
        }
    }, [lastMessageRef.current]);

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

    useEffect(() => {
        // console.log("lastMessageRef.current", lastMessageRef.current);  // after that this is right
        // console.log("lastMessage", lastMessage); // at first render, lastMessage is right
        if (doesStateChange) {
            setRealLastMessage(lastMessageRef.current)
        } else {
            setRealLastMessage(lastMessage)
        }
    }, [lastMessageRef.current, lastMessage, doesStateChange, realLastMessage])


    const insertNewIntoSupabase = async () => {
        // get realLastMessage from localStorage
        let realLastMessageString = localStorage.getItem('realLastMessage');
        const theRealLastMessage = JSON.parse(realLastMessageString);

        console.log("Inserting into Supabase")
        console.log("chat_id", params.chat_id)
        console.log("user_id", user.id)
        console.log("text", newMessageText)
        console.log("version", 1)
        console.log("previous_message_id", lastMessage.message_id)
        // original_message_id -
        const {data, error} = await supabase
            .from('chat_message')
            .insert([
                {
                    chat_id: params.chat_id,
                    user_id: user.id,
                    text: newMessageText,
                    version: 1,
                    previous_message_id: theRealLastMessage.message_id
                }
            ]);

        if (error) console.error('Error inserting into Supabase:', error);
        else console.log('Inserted into Supabase:', data);
    };

    const insertNewLLMResponseIntoSupabase = async (llmResponse) => {
        // get realLastMessage from localStorage
        let realLastMessageString = localStorage.getItem('realLastMessage');
        const theRealLastMessage = JSON.parse(realLastMessageString);

        console.log("Inserting into Supabase")
        console.log("chat_id", params.chat_id)
        console.log("llm_id", user.id)
        console.log("text", llmResponse)
        console.log("version", 1)
        // console.log("previous_message_id", realLastMessage.message_id)
        console.log("previous_message_id", theRealLastMessage.message_id)
        // original_message_id -
        const {data, error} = await supabase
            .from('chat_message')
            .insert([
                {
                    chat_id: params.chat_id,
                    user_id: user.id,
                    text: llmResponse,
                    version: 1,
                    previous_message_id: theRealLastMessage.message_id
                }
            ]);

        // if (error) console.error('Error inserting into Supabase:', error);
        // else console.log('Inserted into Supabase:', data);
        console.log('Inserted into Supabase:', data);
    };

    const handleSendClick = async () => {
        // router.push(`/projects/${params.id}/chat/${params.chat_id}`);
        // await startFetching();
        await insertNewIntoSupabase();
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
        // refresh the chat window
        setMarkAnswered(!markAnswered);
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
        <div className="flex bg-white">
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


                <div className="stream message">
                    <div className="flex items-start space-x-2 mb-4">
                        <img src={'/profile_image.png'} alt="Stream"
                             className="w-10 h-10 rounded-full object-cover"/>
                        <div className="flex flex-col rounded bg-gray-100 p-2 shadow">
                            <div className="font-bold">{"Stream"}</div>
                            <div className="stream-content" dangerouslySetInnerHTML={{__html: llmMessage}}/>
                        </div>
                    </div>
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
                    {/*<button onClick={handleAddClick}>Test Message</button>*/}
                </div>

                {/*show the realLastMessage from localStorage*/}
                <div>Real lastMessage: {realLastMessage?.text}</div>

                {/*<ChatComponent data={chatData} stream={combinedMessages} setLastMessage={setLastMessage}*/}
                {/*               lastMessage={lastMessage}/>*/}
                {/*<ChatStream/>*/}


            </div>
        </div>
    );
}


// https://chat.openai.com/c/9346606b-564e-4313-bb47-5fee9b99759b

