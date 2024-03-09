export interface MessageData {
    message_id: string;
    version: number;
    text: string;
    original_message_id?: string;
    previous_message_id?: string;

    [key: string]: any; // Allows for additional properties as needed
}

export class MessageNode {
    message_id: string;
    data: MessageData;
    children: MessageNode[] = [];
    versions: MessageNode[] = [];
    currentVersion: number = 0;

    constructor(message_id: string, data: MessageData) {
        this.message_id = message_id;
        this.data = data;
    }

    // Set the current version for this message
    setCurrentVersion(versionIndex: number): void {
        if (versionIndex >= 0 && versionIndex < this.versions.length) {
            this.currentVersion = versionIndex;
        } else {
            console.error("Invalid version index");
        }
    }

    // Get the data for the current version of this message
    getCurrentVersionData(): string {
        return this.versions[this.currentVersion]?.data || this.data;
    }

    // Serialize the node (and its children and versions) to a JSON object
    toJSON(): object {
        return {
            data: this.data,
            currentVersion: this.currentVersion,
            children: this.children.map(child => child.toJSON()),
            versions: this.versions.map(version => version.toJSON())
        };
    }

    addChild(node: MessageNode): void {
        this.children.push(node);
    }

    addVersion(node: MessageNode): void {
        this.versions.push(node);
    }

    findNodeById(id: string): MessageNode | null {
        if (this.data.message_id === id) {
            return this;
        }
        for (const child of this.children) {
            const found = child.findNodeById(id);
            if (found) {
                return found;
            }
        }
        for (const version of this.versions) {
            const found = version.findNodeById(id);
            if (found) {
                return found;
            }
        }
        return null;
    }
}


// Utility function to build the tree from the data
export const buildTree = (data: MessageData[]): MessageNode | null => {
    const nodes: { [id: string]: MessageNode } = {};

    // Create a MessageNode for each message
    data.forEach(item => {
        nodes[item.message_id] = new MessageNode(item.message_id, item);
    });

    // Associate messages with their versions and children
    data.forEach(item => {
        const currentNode = nodes[item.message_id];

        if (item.original_message_id) {
            const originalNode = nodes[item.original_message_id];
            if (originalNode) {
                originalNode.addVersion(currentNode);
                // If there's a newer version, set that as the current version
                if (item.version > originalNode.currentVersion) {
                    originalNode.currentVersion = item.version;
                }
            }
        } else if (item.previous_message_id) {
            const parentNode = nodes[item.previous_message_id];
            if (parentNode) {
                parentNode.addChild(currentNode);
            }
        }
    });

    // Find the root node. The root is the one with version 1 and no previous message.
    const rootNodes = data.filter(item => item.version === 1 && !item.previous_message_id);

    // If there's no root node, return null
    if (rootNodes.length === 0) {
        return null;
    }

    // If there are multiple root nodes, we choose the first one. Adjust as needed.
    return nodes[rootNodes[0].message_id];
};

// Function to add a new node to the tree. This should be called with the new message data
export const addNewNode = (root: MessageNode, newData: MessageData): void => {
    const newNode = new MessageNode(newData.message_id, newData);

    if (newData.previous_message_id) {
        const parentNode = root.findNodeById(newData.previous_message_id);
        if (!parentNode) {
            console.error("Parent node not found.");
            return;
        }
        parentNode.addChild(newNode);
    } else if (newData.original_message_id) {
        const originalNode = root.findNodeById(newData.original_message_id);
        if (!originalNode) {
            console.error("Original node not found.");
            return;
        }
        originalNode.addVersion(newNode);
    } else {
        console.error("New node is not a reply or a version. Adding new roots is not supported in this function.");
    }
};

// Function to delete a node or a version of a node from the tree
export const deleteNode = (root: MessageNode, messageId: string, versionIndex?: number): void => {
    const nodeToDelete = root.findNodeById(messageId);
    if (!nodeToDelete) {
        console.error("Node not found.");
        return;
    }

    if (typeof versionIndex === 'number') {
        // Here, you might also need to handle reassigning the current version if necessary
        if (versionIndex >= 0 && versionIndex < nodeToDelete.versions.length) {
            nodeToDelete.versions.splice(versionIndex, 1);
            // Reevaluate current version if needed here
        } else {
            console.error("Invalid version index.");
        }
    } else {
        const deleteRecursive = (currentNode: MessageNode, nodeId: string) => {
            currentNode.children = currentNode.children.filter(child => child.data.message_id !== nodeId);
            currentNode.versions = currentNode.versions.filter(version => version.data.message_id !== nodeId);

            currentNode.children.forEach(child => deleteRecursive(child, nodeId));
            currentNode.versions.forEach(version => deleteRecursive(version, nodeId));
        };

        if (root.data.message_id === messageId) {
            console.error("Cannot delete the root of the tree via this method.");
        } else {
            deleteRecursive(root, messageId);
        }
    }
};
