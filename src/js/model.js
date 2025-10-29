class ChatModel {
    constructor() {
        this.messages = [];
        this.observers = [];
        this.storageKey = 'chat-history';
        this.loadFromStorage();
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    notify(event, data) {
        this.observers.forEach(observer => observer(event, data));
    }

    addMessage(text, isUser) {
        const message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            text: text,
            isUser: isUser,
            timestamp: new Date().toISOString(),
            edited: false
        };

        this.messages.push(message);
        this.saveToStorage();
        this.notify('messageAdded', message);
        return message;
    }

    getAllMessages() {
        return [...this.messages];
    }

    getMessageById(id) {
        return this.messages.find(msg => msg.id === id);
    }

    updateMessage(id, newText) {
        const message = this.getMessageById(id);
        if (!message) {
            throw new Error('Message not found');
        }

        if (!message.isUser) {
            throw new Error('Cannot edit bot messages');
        }

        message.text = newText;
        message.edited = true;
        message.editedAt = new Date().toISOString();

        this.saveToStorage();
        this.notify('messageUpdated', message);
        return message;
    }

    deleteMessage(id) {
        const index = this.messages.findIndex(msg => msg.id === id);
        if (index === -1) {
            throw new Error('Message not found');
        }

        const deleted = this.messages.splice(index, 1)[0];
        this.saveToStorage();
        this.notify('messageDeleted', deleted);
        return deleted;
    }

    clearAll() {
        this.messages = [];
        this.saveToStorage();
        this.notify('allCleared', null);
    }

    saveToStorage() {
        try {
            const data = JSON.stringify(this.messages);
            localStorage.setItem(this.storageKey, data);
            this.notify('dataSaved', new Date().toISOString());
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            this.notify('saveError', error.message);
        }
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);

                if (Array.isArray(parsed)) {
                    this.messages = parsed.filter(msg =>
                        msg.id &&
                        typeof msg.text === 'string' &&
                        typeof msg.isUser === 'boolean'
                    );
                    this.notify('dataLoaded', this.messages);
                } else {
                    throw new Error('Invalid data format');
                }
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.messages = [];
            this.notify('loadError', error.message);
        }
    }

    exportData() {
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            messageCount: this.messages.length,
            messages: this.messages
        };
    }

    importData(data) {
        try {
            if (!data.messages || !Array.isArray(data.messages)) {
                throw new Error('Invalid import format: messages array not found');
            }
            const validMessages = data.messages.filter(msg =>
                msg.id &&
                typeof msg.text === 'string' &&
                typeof msg.isUser === 'boolean'
            );

            if (validMessages.length === 0) {
                throw new Error('No valid messages found in import');
            }

            this.messages = validMessages;
            this.saveToStorage();
            this.notify('dataImported', this.messages);
            return validMessages.length;
        } catch (error) {
            console.error('Failed to import data:', error);
            this.notify('importError', error.message);
            throw error;
        }
    }

    getMessageCount() {
        return this.messages.length;
    }
}

export default ChatModel;