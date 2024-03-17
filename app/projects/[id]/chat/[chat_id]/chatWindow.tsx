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
import MessageComponent from "@/app/projects/[id]/chat/[chat_id]/ChatComponent";

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

// // create sample LLM with LLMProps
// const pickedLLM: LLMProps = {
//     llm_id: "8db18f56-772b-4275-8316-a127a0617f45",
//     name: "Test gpt-4-turbo-preview",
//     version: "1"
// }


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
    const [pickedLLM, setPickedLLM] = useState<LLMProps[]>([]);
    const [selectedLLM, setSelectedLLM] = useState<string>('');
    const [secondarySelectedLLM, setSecondarySelectedLLM] = useState<string>('');
    const [enableSecondaryLLM, setEnableSecondaryLLM] = useState<boolean>(false);

    const [llmMessage, setLLMMessage] = useState<string>("");
    const [markAnswered, setMarkAnswered] = useState<boolean>(false);

    const [rootMessageExist, setRootMessageExist] = useState(true);
    const [rootMessage, setRootMessage] = useState(true);

    const messagesEndRef = useRef(null)

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView()
        // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

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
        console.log("Calling useEffect for get initial chat messages")
        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase
                .from('llm')
                .select()

            if (data) {
                if (data.length > 0) {
                    // console.log("Data length", data.length);
                    setPickedLLM(data);
                    setSelectedLLM(data[0].llm_id);
                    setSecondarySelectedLLM(data[0].llm_id);
                }
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

    useEffect(() => {
        // Check if messageTree exists and has data
        if (messageTree && Object.keys(messageTree).length !== 0) {
            // If messageTree exists, we are not at the root message
            setRootMessageExist(false);
        } else {
            // If messageTree doesn't exist or is empty, we are at the root message
            setRootMessageExist(true);
        }

        scrollToBottom()
    }, [messageTree]);


    const insertNewIntoSupabase = async () => {
        // get realLastMessage from localStorage
        let realLastMessageString = localStorage.getItem('realLastMessage');
        const theRealLastMessage = JSON.parse(realLastMessageString);

        console.log("Inserting into Supabase")
        console.log("chat_id", params.chat_id)
        console.log("user_id", user.id)
        console.log("text", newMessageText)
        console.log("version", 1)

        if (rootMessageExist) {
            console.log("rootMessageExist is true")
            const {data, error} = await supabase
                .from('chat_message')
                .insert([
                    {
                        chat_id: params.chat_id,
                        user_id: user.id,
                        text: newMessageText,
                        version: 1,
                    }
                ]);


            if (error) console.error('Error inserting into Supabase:', error);
            else console.log('Inserted into Supabase:', data);
        } else {
            // console.log("previous_message_id", lastMessage.message_id)
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
        }

        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase.from('chat_message').select().eq('chat_id', params.chat_id)

            if (data && data.length > 0) {
                setChatData(data);
                initializeOrUpdateTree(data);
            } else {
                console.error("No LLM models found or error fetching models:", error);
            }
            setIsLoading(false);
        };

        await fetchData();


    };

    const insertNewLLMResponseIntoSupabase = async (llmResponse) => {
        // get realLastMessage from localStorage
        let realLastMessageString = localStorage.getItem('realLastMessage');
        const theRealLastMessage = JSON.parse(realLastMessageString);

        console.log("Inserting into Supabase")
        console.log("chat_id", params.chat_id)
        console.log("llm_id",selectedLLM)
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
                    llm_id: selectedLLM,
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
        console.log("LLMMesage", llmMessage);
        // resetLLMMessages();

        await insertNewIntoSupabase();
        await startFetching();
        console.log("Start fetching Done");

        // get LLM response from localStorage
        const llmResponseString = localStorage.getItem('llmResponse');
        const llmResponse = JSON.parse(llmResponseString);
        if (llmResponse !== "") {
            await insertNewLLMResponseIntoSupabase(llmResponse);
            setLLMMessage("")
            resetLLMMessages();
            // clear localStorage
            localStorage.removeItem('llmResponse');
        }

        // refresh the chat window
        setMarkAnswered(!markAnswered);
    };

    const resetLLMMessages = () => {
        setLLMMessage("");
    }

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

    const toggle = () => {
        setEnableSecondaryLLM(!enableSecondaryLLM);
    };




    return (
        <div className="flex bg-white">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">

                <div className="flex items-center space-x-3 py-2">
                    <div className="font-bold">Primary LLM:</div>
                    <select
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2"
                        value={selectedLLM}
                        onChange={(e) => {
                            setSelectedLLM(e.target.value);
                            console.log("Primary LLM", e.target.value);
                        }}
                    >
                        {pickedLLM.map((llm) => (
                            <option key={llm.llm_id} value={llm.llm_id}>{llm.name} - {llm.version}</option>
                        ))}
                    </select>

                    <div className="font-bold">Secondary LLM:</div>
                    <select
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2"
                        value={secondarySelectedLLM}
                        onChange={(e) => {
                            setSecondarySelectedLLM(e.target.value);
                            console.log("Secondary LLM", e.target.value);
                        }}
                        disabled={!enableSecondaryLLM}
                    >
                        {pickedLLM.map((llm) => (
                            <option key={llm.llm_id} value={llm.llm_id}>{llm.name} - {llm.version}</option>
                        ))}
                    </select>

                    <div className="font-bold">Enable Secondary:</div>
                    <button
                        onClick={() => setEnableSecondaryLLM(!enableSecondaryLLM)}
                        className={`w-16 h-8 text-sm text-white font-medium py-2 px-4 rounded-lg ${enableSecondaryLLM ? 'bg-green-500' : 'bg-gray-400'}`}
                    >
                        {enableSecondaryLLM ? 'ON' : 'OFF'}
                    </button>
                </div>


                <div className="chat-window">
                    {rootMessageExist ? (
                        <div>
                            {/* Placeholder for when rootMessageExist is true. You can add your single component code here. */}
                            <div>Your component or content for the root message</div>
                            {/*    show chatdata*/}
                            <div>
                                {chatData.map((message) => (
                                    <div key={message.message_id} className="flex items-start space-x-2 mb-4">
                                        <img src={'/profile_image.png'} alt="Stream"
                                             className="w-10 h-10 rounded-full object-cover"/>
                                        <div className="flex flex-col rounded bg-gray-100 p-2 shadow">
                                            <div className="font-bold">{message.user_id}</div>
                                            <div className="message-content">{message.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/*<button onClick={toggle}>Toggle</button>*/}
                            {/* Conditional rendering based on the existence of messageTree */}
                            {messageTree ? (
                                <div>
                                    {console.log("Root Message", rootMessageExist)}
                                    <MessageComponent
                                        node={messageTree}
                                        currentMessage={currentMessage}
                                        lastMessageRef={lastMessageRef}
                                        setCurrentMessage={updateCurrentMessage}
                                        doesStateChange={doesStateChange}
                                        setDoesStateChange={updateDoesStateChange}
                                    />
                                </div>
                            ) : (
                                <div>
                                    {console.log("Root Message", rootMessageExist)}
                                    <p>No messages to display</p>
                                </div>
                            )}
                        </div>
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
                {/*<div>Real lastMessage: {realLastMessage?.text}</div>*/}

                {/*<ChatComponent data={chatData} stream={combinedMessages} setLastMessage={setLastMessage}*/}
                {/*               lastMessage={lastMessage}/>*/}
                {/*<ChatStream/>*/}

                <div style={{marginBottom: 100}} ref={messagesEndRef}/>


            </div>
        </div>
    );
}


// https://chat.openai.com/c/9346606b-564e-4313-bb47-5fee9b99759b

