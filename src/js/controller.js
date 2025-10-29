import { getElizaResponse } from './eliza.js';

class ChatController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init();
    }

    init() {
        this.model.subscribe((event, data) => this.handleModelUpdate(event, data));

        this.bindEvents();

        const messages = this.model.getAllMessages();
        this.view.renderMessages(messages);
        this.view.updateMessageCount(this.model.getMessageCount());
    }

    bindEvents() {
        const elements = this.view.getElements();

        elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendMessage();
        });

        elements.exportBtn.addEventListener('click', () => {
            this.handleExport();
        });

        elements.importBtn.addEventListener('click', () => {
            elements.importFile.click();
        });

        elements.importFile.addEventListener('change', (e) => {
            this.handleImport(e);
        });

        elements.clearBtn.addEventListener('click', () => {
            this.handleClearHistory();
        });

        elements.messagesContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-small');
            if (!button) return;

            const action = button.dataset.action;
            const messageId = button.dataset.messageId;

            if (action === 'edit') {
                this.handleEditMessage(messageId);
            } else if (action === 'delete') {
                this.handleDeleteMessage(messageId);
            }
        });
    }

    handleModelUpdate(event, data) {
        switch (event) {
            case 'messageAdded':
                this.view.renderMessage(data);
                this.view.updateMessageCount(this.model.getMessageCount());
                break;

            case 'messageUpdated':
                this.view.updateMessage(data);
                break;

            case 'messageDeleted':
                this.view.removeMessage(data.id);
                this.view.updateMessageCount(this.model.getMessageCount());
                break;

            case 'allCleared':
                this.view.clearMessages();
                this.view.updateMessageCount(0);
                break;

            case 'dataSaved':
                this.view.updateLastSaved(data);
                break;

            case 'dataLoaded':
                this.view.renderMessages(data);
                this.view.updateMessageCount(this.model.getMessageCount());
                break;

            case 'dataImported':
                this.view.renderMessages(data);
                this.view.updateMessageCount(this.model.getMessageCount());
                alert(`Successfully imported ${data.length} messages`);
                break;

            case 'saveError':
            case 'loadError':
            case 'importError':
                alert(`Error: ${data}`);
                break;
        }
    }

    handleSendMessage() {
        const elements = this.view.getElements();
        const text = elements.input.value.trim();

        if (!text) return;

        this.model.addMessage(text, true);

        elements.input.value = '';

        const botResponse = getElizaResponse(text);
        setTimeout(() => {
            this.model.addMessage(botResponse, false);
        }, 500);
    }

    handleEditMessage(messageId) {
        const message = this.model.getMessageById(messageId);
        if (!message) return;

        this.view.showEditForm(
            messageId,
            message.text,
            (id, newText) => {
                try {
                    this.model.updateMessage(id, newText);
                } catch (error) {
                    alert(error.message);
                }
            },
            () => {
            }
        );
    }

    handleDeleteMessage(messageId) {
        const message = this.model.getMessageById(messageId);
        if (!message) return;

        const confirmed = confirm('Are you sure you want to delete this message?');
        if (confirmed) {
            try {
                this.model.deleteMessage(messageId);
            } catch (error) {
                alert(error.message);
            }
        }
    }

    handleClearHistory() {
        if (this.model.getMessageCount() === 0) {
            alert('Chat history is already empty');
            return;
        }

        const confirmed = confirm('Are you sure you want to clear all chat history? This cannot be undone.');
        if (confirmed) {
            this.model.clearAll();
        }
    }

    handleExport() {
        if (this.model.getMessageCount() === 0) {
            alert('No messages to export');
            return;
        }

        try {
            const data = this.model.exportData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert(`Export failed: ${error.message}`);
        }
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        event.target.value = '';

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const count = this.model.importData(data);
            } catch (error) {
                alert(`Import failed: ${error.message}`);
            }
        };

        reader.onerror = () => {
            alert('Failed to read file');
        };

        reader.readAsText(file);
    }
}

export default ChatController;