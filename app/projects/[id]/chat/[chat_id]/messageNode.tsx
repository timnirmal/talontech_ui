// Define a message tree node
export class MessageNode {
    constructor(data) {
        this.data = data; // the message data itself
        this.replies = []; // children messages (branches)
        this.versions = []; // different versions of this message
    }

    addReply(message) {
        this.replies.push(new MessageNode(message));
    }

    addVersion(message) {
        this.versions.push(message);
    }

    findNodeById(messageId, parentNode = null) {
        if (this.data.message_id === messageId) {
            return {node: this, parent: parentNode};
        }
        for (const reply of this.replies) {
            const result = reply.findNodeById(messageId, this);
            if (result) {
                return result;
            }
        }
        return null;
    }

    updateReply(updatedMessage) {
        const result = this.findNodeById(updatedMessage.previous_message_id);
        if (result) {
            result.node.addVersion(updatedMessage);
        }
    }

    deleteReply(messageId) {
        const result = this.findNodeById(messageId);
        if (result && result.parent) {
            // Re-attach replies of the deleted node to the parent node
            result.parent.replies = result.parent.replies.concat(result.node.replies);
            // Filter out the deleted node
            result.parent.replies = result.parent.replies.filter(reply => reply.data.message_id !== messageId);
        }
    }
}