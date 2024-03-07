// MessageNode class updated to handle versions
import React from "react";

class MessageNode {
    constructor(data) {
        this.versions = {[data.version]: data};
        this.currentVersion = data.version;
        this.children = [];
    }

    addVersion(data) {
        // this.versions[data.version] = data;
        // this.currentVersion = data.version; // Update to latest version
        this.versions[data.version] = data;
    }

    setCurrentVersion(version) {
        if (this.versions[version]) {
            this.currentVersion = version;
        }
    }

    getCurrentVersionData() {
        return this.versions[this.currentVersion];
    }

    addChild(childNode) {
        // this.children.push(childNode);
        if (childNode.currentVersion === 1) {
            this.children.push(childNode);
        }
    }
}

// Utility function to build the tree from the data
const buildTree = (data) => {
    const nodes = {};
    let root = null;

    // First pass to create nodes
    data.forEach(item => {
        nodes[item.message_id] = new MessageNode(item);
    });

    // Second pass to associate versions and set up the tree structure
    data.forEach(item => {
        if (item.original_message_id) {
            // If original_message_id is present, it's a version of an existing message
            const originalNode = nodes[item.original_message_id];
            originalNode.addVersion(item);
            nodes[item.message_id].currentVersion = item.version; // Set the current version
        } else if (item.previous_message_id) {
            // If previous_message_id is present, it's a child of another message
            const parentNode = nodes[item.previous_message_id];
            parentNode.addChild(nodes[item.message_id]);
        }

        if (!item.previous_message_id && item.version === 1) {
            // This is the root of the tree
            root = nodes[item.message_id];
        }
    });

    return root;
};

// Recursive React component to render the tree
// Recursive React component to render the tree with only one version visible
const MessageComponent = ({ node, isChild }) => {
    const versionNumbers = Object.keys(node.versions).map(Number).sort((a, b) => a - b);
    const [currentVersion, setCurrentVersion] = React.useState(node.currentVersion);

    const navigateVersion = (delta) => {
        const currentIndex = versionNumbers.indexOf(currentVersion);
        const newVersionIndex = currentIndex + delta;

        if (newVersionIndex >= 0 && newVersionIndex < versionNumbers.length) {
            setCurrentVersion(versionNumbers[newVersionIndex]);
            node.setCurrentVersion(versionNumbers[newVersionIndex]);
        }
    };

    const currentVersionData = node.getCurrentVersionData();

    const renderVersionControls = (node) => {
        return (
            <div>
                <button onClick={() => navigateVersion(-1)} disabled={currentVersion === versionNumbers[0]}>
                    {'<'}
                </button>
                <button onClick={() => navigateVersion(1)} disabled={currentVersion === versionNumbers[versionNumbers.length - 1]}>
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
                <img src={'/profile_image.png'} alt="Sender" className="w-10 h-10 rounded-full object-cover" />
                <div className={`flex flex-col rounded ${currentVersionData.user_id ? 'bg-blue-100' : 'bg-green-100'} p-2`}>
                    <div className="font-bold">{"Sender's Name"}</div>
                    <div>{currentVersionData.text}</div>
                    {/* Include version navigation if there are multiple versions */}
                    {versionNumbers.length > 1 && renderVersionControls(node)}
                </div>
            </div>
            {/* Render replies (if any) at the same level rather than nested */}
            {node.children.map(child => (
                <MessageComponent key={child.getCurrentVersionData().message_id} node={child} isChild={true} />
            ))}
        </div>
    );
};



// Main Chat component that uses the tree
const ChatComponent = ({data, stream}) => {
    const root = buildTree(data); // build the tree from data

    console.log("root", root);

    return (
        <div>
            {root && <MessageComponent node={root}/>}
            {/*<div*/}
            {/*    className="stream mt-4 p-2 bg-gray-100 rounded shadow"*/}
            {/*    dangerouslySetInnerHTML={{__html: stream}}*/}
            {/*/>*/}
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

