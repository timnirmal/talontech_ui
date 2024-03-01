import React, { useState } from 'react';

const MessageNodeComponent = ({ node }) => {
    console.log("Rendering MessageNodeComponent", node);
    const [currentVersionIndex, setCurrentVersionIndex] = useState(0);

    const goToNextVersion = () => {
        if (currentVersionIndex < node.versions.length - 1) {
            setCurrentVersionIndex(currentVersionIndex + 1);
        }
    };

    const goToPrevVersion = () => {
        if (currentVersionIndex > 0) {
            setCurrentVersionIndex(currentVersionIndex - 1);
        }
    };

    const currentNode = node.versions.length > 0 ? node.versions[currentVersionIndex] : node;

    return (
        <div>
            <div>{currentNode.data.text}</div>
            <div>Replies: {currentNode.replies.length}</div>
            <div>Versions: {node.versions.length}</div>
            {node.versions.length > 1 && (
                <div>
                    <button onClick={goToPrevVersion} disabled={currentVersionIndex === 0}>&lt;</button>
                    <button onClick={goToNextVersion} disabled={currentVersionIndex === node.versions.length - 1}>&gt;</button>
                </div>
            )}
            {currentNode.replies.length > 0 && (
                <div style={{ marginLeft: '20px' }}>
                    {currentNode.replies.map((reply, index) => (
                        <MessageNodeComponent key={reply.data.message_id} node={reply} />
                    ))}
                </div>
            )}
        </div>
    );
};

const MessageViewerComponent = ({messageTree}) => {
    return (
        <div>
            {messageTree.map((rootNode, index) => (
                <MessageNodeComponent key={index} node={rootNode} />
            ))}
        </div>
    );
};

export default MessageViewerComponent;


// Compare this snippet from app/projects/%5Bid%5D/chat/%5Bchat_id%5D/messageNode.tsx:

