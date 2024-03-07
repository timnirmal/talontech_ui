// MessageNode class updated to handle versions
import React from "react";

class MessageNode {
    constructor(data) {
        this.versions = { [data.version]: data };
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
const MessageComponent = ({ node }) => {
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

    // Render the active version of the message and its replies if they are the current versions
    return (
        <div>
            <p>{currentVersionData.text}</p>
            {versionNumbers.length > 1 && (
                <div>
                    <button onClick={() => navigateVersion(-1)} disabled={currentVersion === versionNumbers[0]}>
                        {'<'}
                    </button>
                    <button onClick={() => navigateVersion(1)} disabled={currentVersion === versionNumbers[versionNumbers.length - 1]}>
                        {'>'}
                    </button>
                    <span>Version {currentVersion} of {versionNumbers.length}</span>
                </div>
            )}
            <div className="replies">
                {node.children.map(child => {
                    // Only render the child if it's the current version
                    const childCurrentVersionData = child.versions[child.currentVersion];
                    if (childCurrentVersionData.version === child.currentVersion) {
                        return <MessageComponent key={childCurrentVersionData.message_id} node={child} />;
                    }
                    return null; // Do not render the child if it's not the current version
                })}
            </div>
        </div>
    );
};



// // MessageNode class to represent each message
// class MessageNode {
//     constructor(data) {
//         this.data = data;
//         this.children = [];
//     }
//
//     addChild(childNode) {
//         this.children.push(childNode);
//     }
// }
//
// // Utility function to build the tree from the data
// const buildTree = (data) => {
//     const nodes = {};
//     let root = null;
//
//     data.forEach(item => {
//         nodes[item.message_id] = new MessageNode(item);
//     });
//
//     Object.values(nodes).forEach(node => {
//         if (node.data.previous_message_id) {
//             nodes[node.data.previous_message_id].addChild(node);
//         } else {
//             root = node;
//         }
//     });
//
//     return root;
// };
//
// // Recursive React component to render the tree
// const MessageComponent = ({ node }) => {
//     return (
//         <div>
//             <p>{node.data.text}</p>
//             <div className="replies">
//                 {node.children.map(child => (
//                     <MessageComponent key={child.data.message_id} node={child} />
//                 ))}
//             </div>
//         </div>
//     );
// };

// Main Chat component that uses the tree
const ChatComponent = ({ data }) => {
    const root = buildTree(data); // build the tree from data

    console.log("root", root);

    return (
        <div>
            {root && <MessageComponent node={root} />}
        </div>
    );
};

export default ChatComponent;


// class MessageNode {
//     constructor(data) {
//         this.data = data; // The message data itself
//         this.replies = []; // Children messages (replies)
//         this.versions = []; // Different versions of this message, excluding the original
//         this.branches = []; // Separate branches that start from this message
//     }
//
//     // Add a reply to the message
//     addReply(replyData) {
//         const replyNode = new MessageNode(replyData);
//         this.replies.push(replyNode);
//     }
//
//     // Add a version of this message
//     // addVersion(versionData) {
//     //     this.versions.push(versionData);
//     // }
//
//     addVersion(versionData) {
//         const versionNode = new MessageNode(versionData);
//         this.versions.push(versionNode);
//     }
//
//     // Add a new branch starting from this message
//     addBranch(branchData) {
//         const branchNode = new MessageNode(branchData);
//         this.branches.push(branchNode);
//     }
//
//     // Find a node by message_id, searching through replies and branches
//     findNodeById(messageId, includeBranches = false) {
//         if (this.data.message_id === messageId) {
//             return this;
//         }
//         for (let reply of this.replies) {
//             let found = reply.findNodeById(messageId, includeBranches);
//             if (found) return found;
//         }
//         if (includeBranches) {
//             for (let branch of this.branches) {
//                 let found = branch.findNodeById(messageId, includeBranches);
//                 if (found) return found;
//             }
//         }
//         return null; // Node not found
//     }
// }
//
//
//
// function createMessageTree(messagesArray) {
//     const nodesById = {}; // To keep track of all nodes by their message_id
//     const rootNodes = []; // To keep track of all root nodes
//
//     // First pass to create nodes for all messages that are not versions of other messages
//     messagesArray.forEach(messageData => {
//         nodesById[messageData.message_id] = new MessageNode(messageData);
//     });
//
//     console.log("nodesById", nodesById);
//
//     // first we add root node where previous message is null
//     //
//     // 	 if (!messageData.previous_message_id) {
//     //             rootNodes.push(nodesById[messageData.message_id]);
//     //             return;
//     //         }
//     //
//     // then we go for adding replies
//     //
//     // 	if (messageData.previous_message_id) { it is a reply
//     //
//     // before adding it as a reply, we need to check if it is a version or branch..
//     //
//     // if it is a version then it has version number highet than 1. (1 is the original messsage)
//     //
//     // if you find something that has same version number then attach it to version of original message
//
//     const assignNodes = () => {
//         Object.keys(nodesById).forEach(messageId => {
//             const node = nodesById[messageId];
//             const parentId = node.data.previous_message_id;
//
//             if (!parentId) {
//                 // It's a root node
//                 rootNodes.push(node);
//                 delete nodesById[messageId]; // Remove from nodesById once assigned
//             } else if (nodesById[parentId]) {
//                 // Parent exists, decide if it's a reply, version, or branch
//                 const parentNode = nodesById[parentId];
//
//                 // Example logic to decide between reply, version, and branch
//                 if (node.data.version_number && node.data.version_number > 1) {
//                     parentNode.addVersion(node.data); // Add as version
//                 } else {
//                     parentNode.addReply(node.data); // Add as reply
//                 }
//
//                 delete nodesById[messageId]; // Remove from nodesById once assigned
//             }
//             // Branch logic not explicitly handled; adjust as needed
//         });
//     };
//
//     // Keep trying to assign nodes until all are placed
//     let prevUnassignedCount = null;
//     while (Object.keys(nodesById).length > 0 && Object.keys(nodesById).length !== prevUnassignedCount) {
//         prevUnassignedCount = Object.keys(nodesById).length;
//         console.log("Unassigned nodes:", prevUnassignedCount);
//         assignNodes();
//     }
//
//     // Log to verify if all nodes are assigned (nodesById should be empty)
//     console.log("Unassigned nodes (should be empty):", nodesById, prevUnassignedCount);
//
//
//     return rootNodes;
// }
//
//
// const renderMessageNode = (node) => (
//     <div key={node.data.message_id}>
//         <p>{node.data.text}</p>
//         {node.versions.map((version, index) => (
//             <div key={index}>Version: {version.text}</div>
//         ))}
//         {node.replies.map(reply => renderMessageNode(reply))}
//         {node.branches.map(branch => renderMessageNode(branch))}
//     </div>
// );
//
// export default function TestMessageTree({data}) {
//     const messageTreeRoots = createMessageTree(data);
//     console.log("messageTreeRoots", messageTreeRoots);
//
//     return (
//         <div>
//             {messageTreeRoots.map(rootNode => renderMessageNode(rootNode))}
//         </div>
//     );
// }
