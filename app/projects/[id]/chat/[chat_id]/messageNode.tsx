class MessageNode {
    constructor(data) {
        this.data = data; // The message data itself, includes all message properties
        this.replies = []; // Children messages (branches as replies)
        this.versions = []; // Different versions of this message
        this.branches = []; // Separate branches that start from this message
        this.currentVersionIndex = 0; // Index of the current version
    }

    // Navigate to the next version of the message
    nextVersion() {
        if (this.currentVersionIndex < this.versions.length - 1) {
            this.currentVersionIndex++;
        }
    }

    // Navigate to the previous version of the message
    prevVersion() {
        if (this.currentVersionIndex > 0) {
            this.currentVersionIndex--;
        }
    }

    // Get the current version of the message
    getCurrentVersion() {
        return this.versions[this.currentVersionIndex] || this.data;
    }

    // Add a reply to the message
    addReply(message) {
        const replyNode = new MessageNode(message);
        this.replies.push(replyNode);
        return replyNode; // Return the new node
    }

    // Add a version of this message
    addVersion(message) {
        this.versions.push(message);
        // When a new version is added, we consider it the current version
        this.currentVersionIndex = this.versions.length - 1;
    }

    // Add a new branch starting from this message
    addBranch(message) {
        const branchNode = new MessageNode(message);
        this.branches.push(branchNode);
        return branchNode;
    }

    // Find a node by message_id, searching versions, replies, and branches
    findNodeById(messageId, includeBranches = false) {
        // Check if this node matches
        if (this.data.message_id === messageId) {
            return this;
        }
        // Check among versions
        for (let version of this.versions) {
            if (version.message_id === messageId) {
                return this; // Return the base node since versions are not separate nodes
            }
        }
        // Search in replies
        for (let reply of this.replies) {
            let found = reply.findNodeById(messageId, includeBranches);
            if (found) return found;
        }
        // Optionally search in branches
        if (includeBranches) {
            for (let branch of this.branches) {
                let found = branch.findNodeById(messageId, includeBranches);
                if (found) return found;
            }
        }
        return null;
    }

    // Update a reply with a new version of the message
    updateReply(updatedMessage) {
        const result = this.findNodeById(updatedMessage.previous_message_id);
        if (result) {
            result.addVersion(updatedMessage);
        }
    }

    // Delete a reply by message_id
    deleteReply(messageId) {
        // Find the index of the reply to delete
        const index = this.replies.findIndex(reply => reply.data.message_id === messageId);
        if (index !== -1) {
            // Re-attach replies of the deleted node to the parent node
            const [deletedNode] = this.replies.splice(index, 1);
            this.replies = [...this.replies, ...deletedNode.replies];
        }
    }

    // Traverse the tree starting from the leftmost node, considering versions and branches
    traverseTree(callback) {
        // Call the callback function for this node
        callback(this.data);

        // Then, traverse each version
        this.versions.forEach(version => callback(version));

        // Then, traverse each reply
        this.replies.forEach(reply => reply.traverseTree(callback));

        // Optionally, traverse branches
        this.branches.forEach(branch => branch.traverseTree(callback));
    }
}


function createMessageTree(messagesArray) {
    const nodesById = {}; // To keep track of all nodes by their message_id
    const rootNodes = []; // To keep track of all root nodes

    // First pass to create nodes for all messages
    messagesArray.forEach(messageData => {
        nodesById[messageData.message_id] = new MessageNode(messageData);
    });

    // Second pass to establish parent-child relationships
    messagesArray.forEach(messageData => {
        const currentNode = nodesById[messageData.message_id];
        if (messageData.previous_message_id) {
            const parentNode = nodesById[messageData.previous_message_id];
            parentNode.addReply(currentNode);
        } else {
            rootNodes.push(currentNode); // This is a root node
        }

        if (messageData.original_message_id) {
            const originalNode = nodesById[messageData.original_message_id];
            originalNode.addVersion(currentNode.data);
        }

        if (messageData.branch_id) {
            // Assuming branch_parent_id indicates where to attach the branch
            const branchParentNode = nodesById[messageData.branch_parent_id];
            branchParentNode.addBranch(currentNode);
        }
    });

    return rootNodes; // This array contains the tree(s) starting from root nodes
}

const renderMessageNode = (node) => (
    <div key={node.data.message_id}>
        <p>{node.data.text}</p>
        {/* Render versions if they exist */}
        {node.versions.map(version => <div key={version.message_id}>Version: {version.text}</div>)}
        {/* Recursively render replies */}
        {node.replies.map(reply => renderMessageNode(reply))}
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
