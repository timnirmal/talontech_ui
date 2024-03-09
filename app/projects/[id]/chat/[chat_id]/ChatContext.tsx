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

    const initializeOrUpdateTree = useCallback((data: MessageData[]) => {
        const builtTree = buildTree(data);
        setMessageTree(builtTree);
    }, []);

    const addMessage = useCallback((newData: MessageData) => {
        if (messageTree) {
            addNewNode(messageTree, newData);
            // Force update to trigger re-render. This is a simplistic approach;
            // consider using a more sophisticated state management for larger applications.
            setMessageTree(Object.assign({}, messageTree));
        }
    }, [messageTree]);

    const deleteMessage = useCallback((messageId: string, version?: number) => {
        if (messageTree) {
            deleteNode(messageTree, messageId, version);
            // Similar to addMessage, trigger a re-render by updating the state.
            setMessageTree(Object.assign({}, messageTree));
        }
    }, [messageTree]);

    return (
        <ChatContext.Provider value={{ messageTree, addMessage, deleteMessage, initializeOrUpdateTree }}>
            {children}
        </ChatContext.Provider>
    );
};