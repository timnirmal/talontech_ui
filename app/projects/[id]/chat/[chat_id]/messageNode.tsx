class MessageNode {
    constructor(data) {
        this.data = data; // The message data itself
        this.replies = []; // Children messages (replies)
        this.versions = []; // Different versions of this message, excluding the original
        this.branches = []; // Separate branches that start from this message
    }

    // Add a reply to the message
    addReply(replyData) {
        const replyNode = new MessageNode(replyData);
        this.replies.push(replyNode);
    }

    // Add a version of this message
    // addVersion(versionData) {
    //     this.versions.push(versionData);
    // }

    addVersion(versionData) {
        const versionNode = new MessageNode(versionData);
        this.versions.push(versionNode);
    }

    // Add a new branch starting from this message
    addBranch(branchData) {
        const branchNode = new MessageNode(branchData);
        this.branches.push(branchNode);
    }

    // Find a node by message_id, searching through replies and branches
    findNodeById(messageId, includeBranches = false) {
        if (this.data.message_id === messageId) {
            return this;
        }
        for (let reply of this.replies) {
            let found = reply.findNodeById(messageId, includeBranches);
            if (found) return found;
        }
        if (includeBranches) {
            for (let branch of this.branches) {
                let found = branch.findNodeById(messageId, includeBranches);
                if (found) return found;
            }
        }
        return null; // Node not found
    }
}


// function createMessageTree(messagesArray) {
//     const nodesById = {}; // To keep track of all nodes by their message_id
//     const rootNodes = []; // To keep track of all root nodes
//
//     // First pass to create nodes for all messages that are not versions of other messages
//     messagesArray.forEach(messageData => {
//         if (!messageData.original_message_id) {
//             nodesById[messageData.message_id] = new MessageNode(messageData);
//         }
//     });
//
//     // Second pass to establish parent-child relationships and handle versions
//     messagesArray.forEach(messageData => {
//         const originalId = messageData.original_message_id || messageData.message_id;
//         const originalNode = nodesById[originalId];
//
//         // Handle versions of messages
//         if (messageData.version > 1 && originalNode) {
//             originalNode.addVersion(messageData);
//             return; // Skip the rest of the processing for versions
//         }
//
//         // Handle replies to messages
//         if (messageData.previous_message_id) {
//             const parentNode = nodesById[messageData.previous_message_id];
//             if (parentNode) {
//                 parentNode.addReply(messageData);
//             } else {
//                 console.error('Parent message node not found for reply:', messageData);
//             }
//         } else {
//             // If no previous message, this is a root node
//             if (nodesById[messageData.message_id]) {
//                 rootNodes.push(nodesById[messageData.message_id]);
//             }
//         }
//
//         // Handle branches (if applicable)
//         if (messageData.branch_id && messageData.branch_parent_id) {
//             const branchParentNode = nodesById[messageData.branch_parent_id];
//             if (branchParentNode) {
//                 branchParentNode.addBranch(messageData);
//             } else {
//                 console.error('Branch parent message node not found:', messageData);
//             }
//         }
//     });
//
//     return rootNodes;
// }


function createMessageTree(messagesArray) {
    const nodesById = {}; // To keep track of all nodes by their message_id
    const rootNodes = []; // To keep track of all root nodes

    // First pass to create nodes for all messages that are not versions of other messages
    messagesArray.forEach(messageData => {
        nodesById[messageData.message_id] = new MessageNode(messageData);
    });

    console.log("nodesById", nodesById);

    // Second pass to establish parent-child relationships and handle versions
    messagesArray.forEach(messageData => {
        console.log("messageData", messageData);

        // if the message dont have a previous message, it is a root node
        if (!messageData.previous_message_id) {
            rootNodes.push(nodesById[messageData.message_id]);
            return;
        }

        // if the message has a previous message, it is a reply
        const parentNode = nodesById[messageData.previous_message_id];
        if (parentNode) {
            console.log("parentNode", parentNode);
            parentNode.addReply(messageData);
        } else {
            console.error('Parent message node not found for reply:', messageData);
        }

    });

    return rootNodes;
}


const renderMessageNode = (node) => (
    <div key={node.data.message_id}>
        <p>{node.data.text}</p>
        {node.versions.map((version, index) => (
            <div key={index}>Version: {version.text}</div>
        ))}
        {node.replies.map(reply => renderMessageNode(reply))}
        {node.branches.map(branch => renderMessageNode(branch))}
    </div>
);

export default function TestMessageTree({data}) {
    const messageTreeRoots = createMessageTree(data);
    console.log("messageTreeRoots", messageTreeRoots);

    return (
        <div>
            {messageTreeRoots.map(rootNode => renderMessageNode(rootNode))}
        </div>
    );
}
