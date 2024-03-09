// MessageNode class updated to handle versions
import React, {useEffect, useState} from "react";
import {Database} from "@/types/supabase";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useChat} from "@/app/projects/[id]/chat/[chat_id]/ChatContext";

// Recursive React component to render the tree
// Recursive React component to render the tree with only one version visible
const MessageComponent = ({node, isChild, updateLastMessage}) => {
    const versionNumbers = Object.keys(node.versions).map(Number).sort((a, b) => a - b);
    const [currentVersion, setCurrentVersion] = React.useState(node.currentVersion);

    // Inside MessageComponent
    React.useEffect(() => {
        console.log("UseEffect called in MessageComponent");
        console.log("node.currentVersion", node);
        // Listen to changes in version and update local state to force re-render
        setCurrentVersion(node.currentVersion);
    }, [node.currentVersion]);

    const navigateVersion = (delta) => {
        const currentIndex = versionNumbers.indexOf(currentVersion);
        const newVersionIndex = currentIndex + delta;

        if (newVersionIndex >= 0 && newVersionIndex < versionNumbers.length) {
            setCurrentVersion(versionNumbers[newVersionIndex]);
            node.setCurrentVersion(versionNumbers[newVersionIndex]);
        }

        updateLastMessage(node.getCurrentVersionData());

    };

    // console.log("node currentVersionData", node);
    // console.log("node currentVersionData", typeof node);
    const currentVersionData = node.getCurrentVersionData();

    const renderVersionControls = (node) => {
        return (
            <div>
                <button onClick={() => navigateVersion(-1)} disabled={currentVersion === versionNumbers[0]}>
                    {'<'}
                </button>
                <button onClick={() => navigateVersion(1)}
                        disabled={currentVersion === versionNumbers[versionNumbers.length - 1]}>
                    {'>'}
                </button>
                <span>Version {currentVersion} of {versionNumbers.length}</span>
            </div>
        );
    };

    // Render the active version of the message
    return (
        <div className={`message ${isChild ? "child-message" : ""}`}>
            <div key={currentVersionData.message_id} className="flex items-start space-x-2 mb-4">
                <img src={'/profile_image.png'} alt="Sender" className="w-10 h-10 rounded-full object-cover"/>
                <div
                    className={`flex flex-col rounded ${currentVersionData.user_id ? 'bg-blue-100' : 'bg-green-100'} p-2`}>
                    <div className="font-bold">{"Sender's Name"}</div>
                    <div>{currentVersionData.message_id}</div>
                    <div>{currentVersionData.text}</div>
                    {/* Include version navigation if there are multiple versions */}
                    {versionNumbers.length > 1 && renderVersionControls(node)}
                </div>
            </div>
            {/* Render replies (if any) at the same level rather than nested */}
            {node.children.map(child => (
                <MessageComponent key={child.getCurrentVersionData().message_id} node={child} isChild={true}
                                  updateLastMessage={updateLastMessage}/>
            ))}
            {currentVersionData.message_id}
            <div>currentVersion: {currentVersion}</div>
            {/*<div>version: {version}</div>*/}
            <br/>
        </div>
    );
};


// Main Chat component that uses the tree
const ChatComponent = ({data, stream, setLastMessage, lastMessage}) => {
    console.log("Intial data", data);
    // console.log("data", data);
    // const root = buildTree(data); // build the tree from data
    // const [messageTree, setMessageTree] = useState(null);
    // const lastMessage = root?.getLastChild();
    const supabase = createClientComponentClient<Database>();
    const {messageTree, currentBranch, initializeOrUpdateTree} = useChat();
    const [loading, setLoading] = useState(true);

    console.log("messageTree", messageTree);

    useEffect(() => {
        if (data.length > 0) {
            // const builtTree = buildTree(data);
            // setMessageTree(builtTree); // Update the message tree
            // const lastMsg = builtTree.getLastChild().getCurrentVersionData();
            // setLastMessage(lastMsg); // Update the last message
            initializeOrUpdateTree(data);
        }
    }, [data]); // Depend on 'data' prop

    // useEffect(() => {
    //     const channel = supabase.channel('realtime chats')
    //         .on("postgres_changes", {
    //             event: "INSERT",
    //             schema: "public",
    //             table: "chat_message"
    //         }, (payload) => {
    //             console.log("Current Tree");
    //             console.log(messageTree);
    //             // console.log(currentTree);
    //             console.log("Insert payload", payload.new);
    //             setMessageTree(currentTree => {
    //                 // Assuming currentTree is the root node of the tree
    //                 if (!payload.new.previous_message_id && !payload.new.original_message_id) {
    //                     console.log("Root message insertion");
    //                     // Root message insertion
    //                     const rootNode = new MessageNode(payload.new);
    //                     currentTree.children.push(rootNode); // Consider updating logic if root nodes are handled differently
    //                 } else if (payload.new.original_message_id) {
    //                     console.log("New version of an existing message");
    //                     // New version of an existing message
    //                     const originalNode = currentTree.findNodeById(payload.new.original_message_id);
    //                     if (originalNode) {
    //                         originalNode.addVersion(payload.new);
    //                     }
    //                 } else if (payload.new.previous_message_id) {
    //                     console.log("Reply to an existing message");
    //                     // Reply to an existing message
    //                     const parentNode = currentTree.findNodeById(payload.new.previous_message_id);
    //                     if (parentNode) {
    //                         console.log("Parent Node", parentNode);
    //                         const childNode = new MessageNode(payload.new);
    //                         console.log("Child Node", childNode);
    //                         parentNode.addChild(childNode);
    //                         console.log("Parent Node after adding child", parentNode);
    //                     }
    //                 }
    //                 // Return a new tree instance if necessary to trigger re-render
    //                 return {...currentTree};
    //             });
    //         })
    //         .subscribe();
    //
    //     return () => supabase.removeChannel(channel);
    // }, [supabase]);
    //
    // useEffect(() => {
    //     // Update lastMessage on messageTree changes
    //     if (messageTree) {
    //         const lastMsg = messageTree.getLastChild().getCurrentVersionData();
    //         setLastMessage(lastMsg);
    //     }
    // }, [messageTree]);

    if (!messageTree) {
        return <div>Loading...</div>; // or any other placeholder you see fit
    }

    const updateLastMessage = (newLastMessage) => {
        setLastMessage(newLastMessage);
    };


    return (
        <div>
            <MessageComponent node={messageTree} isChild={false} updateLastMessage={updateLastMessage}/>
            {lastMessage && (
                <div>
                    <strong>Last Message: </strong>{lastMessage.text}
                </div>
            )}

            <div className="stream message">
                <div className="flex items-start space-x-2 mb-4">
                    <img src={'/profile_image.png'} alt="Stream"
                         className="w-10 h-10 rounded-full object-cover"/>
                    <div className="flex flex-col rounded bg-gray-100 p-2 shadow">
                        <div className="font-bold">{"Stream"}</div>
                        <div className="stream-content" dangerouslySetInnerHTML={{__html: stream}}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;

