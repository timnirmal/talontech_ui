'use client';

import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import {
    addNewNode,
    buildTree,
    deleteNode,
    MessageNode,
    MessageData,
    // getAutoSelectedBranchAndLastMessage, BranchResult
} from "@/app/projects/[id]/chat/[chat_id]/messageNode";


const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatContextType {
    messageTree: MessageNode | null;
    addMessage: (newData: MessageData) => void;
    deleteMessage: (messageId: string, version?: number) => void;
    initializeOrUpdateTree: (data: MessageData[]) => void;
    // getBranchAndLastMessageFromTree: () => BranchResult;
}

// Custom hook to use the chat context
export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};


export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messageTree, setMessageTree] = useState<MessageNode | null>(null);
    const [currentBranch, setCurrentBranch] = useState(null); // Assuming branch is a part of your message tree structure

    // const navigateBranch = useCallback((branchId) => {
    //     // Logic to set the current branch based on branchId
    //     // This might involve finding the branch in your message tree and setting it as current
    // }, [setMessageTree, messageTree]);

    // const initializeOrUpdateTree = useCallback((data) => {
    //     const builtTree = buildTree(data);
    //     setMessageTree(builtTree);
    // }, [buildTree]);

    const initializeOrUpdateTree = useCallback((data) => {
        console.log("Initialize or update tree", data);
        const builtTree = buildTree(data);
        if (!builtTree) {
            console.log("No built tree");
            // Handle case where buildTree does not return a valid tree
            setMessageTree(new MessageNode(data[0])); // Assuming data is an array and you want to use the first item
        } else {
            console.log("There is Built tree", builtTree);
            setMessageTree(builtTree);
        }
    }, []);

    useEffect(() => {
        console.log("Message tree updated:", messageTree);
    }, [messageTree]);

    const addMessage = useCallback((newData: MessageData) => {
        setMessageTree((currentTree) => addNewNode(currentTree, newData));
    }, []);

    const deleteMessage = useCallback((messageId: string, version?: number) => {
        setMessageTree((currentTree) => {
            if (!currentTree) return null;
            return deleteNode(currentTree, messageId, version);
        });
    }, []);

    // // New function to get a specific branch and last message
    // const getBranchAndLastMessageFromTree = useCallback((): BranchResult => {
    //     return getAutoSelectedBranchAndLastMessage(messageTree);
    // }, [messageTree]);

    // Add more functions as needed, such as sending a message, loading messages, etc.
    return (
        <ChatContext.Provider value={{messageTree, addMessage, deleteMessage, initializeOrUpdateTree}}>
            {children}
        </ChatContext.Provider>
    );
};
