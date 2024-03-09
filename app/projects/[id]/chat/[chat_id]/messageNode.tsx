export interface MessageData {
    message_id: string;
    version: number;
    original_message_id?: string;
    previous_message_id?: string;

    [key: string]: any; // Allows for additional properties as needed
}

// export interface BranchResult {
//     branch: MessageNode[];
//     lastMessage: MessageData | null;
// }

export class MessageNode {
    versions: { [version: number]: MessageData };
    currentVersion: number;
    children: MessageNode[];

    constructor(data: MessageData) {
        this.versions = {[data.version]: data};
        this.currentVersion = data.version;
        this.children = [];
    }

    addVersion(data: MessageData) {
        // this.versions[data.version] = data;
        // this.currentVersion = data.version; // Update to latest version
        this.versions[data.version] = data;
    }

    setCurrentVersion(version: number) {
        if (this.versions[version]) {
            this.currentVersion = version;
        }
    }

    getCurrentVersionData() {
        return this.versions[this.currentVersion];
    }

    addChild(childNode: MessageNode): void {
        this.children.push(childNode);
    }

    getLastChild(): MessageNode {
        if (this.children.length === 0) {
            return this;
        }
        return this.children[this.children.length - 1].getLastChild();
    }

    findNodeById(id: string): MessageNode | null {
        if (this.versions[this.currentVersion].message_id === id) {
            return this;
        }
        for (let child of this.children) {
            let found = child.findNodeById(id);
            if (found) return found;
        }
        return null; // Not found
    }

    removeChildById(childId: string): void {
        this.children = this.children.filter(child => child.getCurrentVersionData().message_id !== childId);
    }

}

// Utility function to build the tree from the data
export const buildTree = (data: MessageData[]): MessageNode | null => {
    console.log("Inside Build Tree", data);
    const nodes: {[id: string]: MessageNode} = {};
    let root: MessageNode | null = null;

    // First pass to create nodes for every message and version
    data.forEach(item => {
        if (!nodes[item.message_id]) {
            nodes[item.message_id] = new MessageNode(item);
        } else {
            // If the node already exists (for versions), add this as a version
            nodes[item.message_id].addVersion(item);
        }
    });

    // Second pass to set up the tree structure
    data.forEach(item => {
        if (item.previous_message_id) {
            const parentNode = nodes[item.previous_message_id];
            // This checks if the child is not already added to prevent duplicates
            if (!parentNode.children.some(child => child.getCurrentVersionData().message_id === item.message_id)) {
                parentNode.addChild(nodes[item.message_id]);
            }
        }

        if (!item.previous_message_id && item.version === 1 && !root) {
            root = nodes[item.message_id];
        }
    });

    // console.log("Build Root", root);
    return root;
};


// Function to add a new node to the tree. This should be called with the new message data
export const addNewNode = (root: MessageNode | null, newData: MessageData): MessageNode | null => {
    if (!root) {
        // If there's no root, the new data either becomes the root or we can't proceed
        if (!newData.previous_message_id && !newData.original_message_id) {
            // This new data is a standalone message, suitable to be a root
            return new MessageNode(newData);
        } else {
            console.error("Cannot add a new node without a root.");
            return null;
        }
    }

    // If it's a root message (no previous_message_id and no original_message_id)
    if (!newData.previous_message_id && !newData.original_message_id) {
        const newNode = new MessageNode(newData);
        // Add this as a new root-level node (assuming multiple roots are possible)
        root.addChild(newNode);
        return root;
    }

    // If it's a new version of an existing message
    if (newData.original_message_id) {
        const originalNode = root.findNodeById(newData.original_message_id);
        if (originalNode) {
            originalNode.addVersion(newData);
            return root; // Tree structure remains unchanged, just the node data is updated
        } else {
            // If original node not found, handle accordingly
            console.error("Original message node not found.");
            return root; // Or decide on other error handling
        }
    }

    // If it's a reply to an existing message
    if (newData.previous_message_id) {
        const parentNode = root.findNodeById(newData.previous_message_id);
        if (parentNode) {
            const newNode = new MessageNode(newData);
            parentNode.addChild(newNode);
            return root; // Tree updated with the new child node
        } else {
            // If parent node not found, handle accordingly
            console.error("Parent message node not found.");
            return root; // Or decide on other error handling
        }
    }

    // If reached here, the new data didn't fit any condition. Handle accordingly.
    console.error("Invalid new message data", newData);
    return root; // Maintain the current tree structure as is
};



// Function to delete a node or a version of a node from the tree
export const deleteNode = (root: MessageNode | null, messageId: string, version: number | null = null): MessageNode | null => {
    if (!root) return null; // If the tree is empty, return null

    // Helper function to delete a node from its parent
    const deleteNodeFromParent = (node: MessageNode, parentNode: MessageNode | null) => {
        if (parentNode) {
            parentNode.children = parentNode.children.filter(child => child !== node);
        }
    };

    // If deleting a specific version of the message
    if (version !== null) {
        let node = root.findNodeById(messageId);
        if (node && node.versions[version]) {
            delete node.versions[version];
            const remainingVersions = Object.keys(node.versions).map(v => parseInt(v));
            if (remainingVersions.length > 0) {
                // If there are remaining versions, set the currentVersion to the first one available
                node.setCurrentVersion(Math.min(...remainingVersions));
            } else {
                // If no versions left, treat this as deleting the entire node
                return deleteNode(root, messageId);
            }
        }
        return root; // Return the modified tree
    }

    // If deleting an entire node
    let parentNode: MessageNode | null = null;

    // Function to recursively find and delete the node
    const findAndDelete = (currentNode: MessageNode, searchId: string): boolean => {
        for (let i = 0; i < currentNode.children.length; i++) {
            if (currentNode.children[i].getCurrentVersionData().message_id === searchId) {
                deleteNodeFromParent(currentNode.children[i], currentNode);
                return true; // Node found and deleted
            } else {
                parentNode = currentNode; // Update parentNode as we dive deeper
                if (findAndDelete(currentNode.children[i], searchId)) {
                    return true; // Node found and deleted in a deeper level
                }
            }
        }
        return false;
    };

    // Special case for deleting the root
    if (root.getCurrentVersionData().message_id === messageId) {
        return null; // Indicating the root should be removed
    } else {
        findAndDelete(root, messageId);
    }

    return root; // Return the modified tree, with the node/version removed
};


// export const getAutoSelectedBranchAndLastMessage = (root: MessageNode | null): BranchResult => {
//     const branch: MessageNode[] = [];
//     let current: MessageNode | null = root;
//     let lastMessage: MessageData | null = null;
//
//     console.log("Root in getAutoSelectedBranchAndLastMessage", current);
//
//     let count = 0;
//
//     while (current) {
//         count++;
//         console.log("count", count);
//         const currentData = current.getCurrentVersionData();
//         console.log("Current in getAutoSelectedBranchAndLastMessage", currentData);
//         branch.push(current); // Add the current node to the branch
//         lastMessage = currentData; // Update last message
//
//         // Select which version to pick (if there are multiple versions, select the first one)
//         const versions = Object.keys(current.versions).map(Number).sort((a, b) => a - b);
//         if (versions.length > 1) {
//             current.setCurrentVersion(versions[0]); // This assumes versions are sorted numerically
//             lastMessage = current.getCurrentVersionData();
//         }
//
//         if (current.children.length > 0) {
//             // Move to the first child for the next iteration
//             current = current.children[0];
//         } else {
//             // End the loop if there are no children
//             current = null;
//         }
//     }
//
//     console.log("Branch in getAutoSelectedBranchAndLastMessage", branch);
//     console.log("Last Message in getAutoSelectedBranchAndLastMessage", lastMessage);
//
//     return { branch, lastMessage };
// };