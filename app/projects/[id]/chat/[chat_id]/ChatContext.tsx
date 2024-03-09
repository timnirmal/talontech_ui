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
    handleVersionChange: (messageId: string, versionIndex: number) => void;
}


// Custom hook to use the chat context
export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};


export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [messageTree, setMessageTree] = useState<MessageNode | null>(null);

    const setCurrentVersionForAllNodes = (node) => {
        node.currentVersion = 1;
        node.children.forEach(setCurrentVersionForAllNodes);
        node.versions.forEach(setCurrentVersionForAllNodes);
    };

    const initializeOrUpdateTree = useCallback((data: MessageData[]) => {
        const builtTree = buildTree(data);
        setCurrentVersionForAllNodes(builtTree);
        setMessageTree(builtTree);
    }, []);

    const addMessage = useCallback((newData: MessageData) => {
        console.log("addMessage", newData);
        console.log("addMessage", newData);
        console.log("addMessage", newData);
        console.log("addMessage", newData);
        console.log("addMessage", newData);
        if (messageTree) {
            addNewNode(messageTree, newData);
            // Force update to trigger re-render. This is a simplistic approach;
            // consider using a more sophisticated state management for larger applications.
            setMessageTree(Object.assign({}, messageTree));
            console.log("New Message Tree", messageTree);
        }else{
        console.log("No message tree");
        }
    }, [messageTree]);

    const deleteMessage = useCallback((messageId: string, version?: number) => {
        if (messageTree) {
            deleteNode(messageTree, messageId, version);
            // Similar to addMessage, trigger a re-render by updating the state.
            setMessageTree(Object.assign({}, messageTree));
        }
    }, [messageTree]);

    const updateVersion = (node, messageId, versionIndex) => {
        if (node.message_id === messageId) {
            node.currentVersion = versionIndex;
            return true; // Indicate that the node has been found and updated
        }
        for (let child of node.children) {
            if (updateVersion(child, messageId, versionIndex)) {
                return true;
            }
        }
        return false; // Indicate that the node was not found in this branch
    };

    const handleVersionChange = useCallback((messageId: string, versionIndex: number) => {
        if (messageTree) {
            const clonedTree = JSON.parse(JSON.stringify(messageTree)); // Clone to ensure immutability
            if (updateVersion(clonedTree, messageId, versionIndex)) {
                setMessageTree(clonedTree); // Update the state to trigger re-render
            }
        }
    }, [messageTree]);

    return (
        <ChatContext.Provider value={{messageTree, addMessage, deleteMessage, initializeOrUpdateTree, handleVersionChange}}>
            {children}
        </ChatContext.Provider>
    );
};