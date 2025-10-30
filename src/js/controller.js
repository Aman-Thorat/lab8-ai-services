import ServiceFactory from './services/ServiceFactory.js';

class ChatController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.serviceFactory = new ServiceFactory();
        this.currentServiceId = 'eliza';
        this.init();
    }

    init() {
        this.model.subscribe((event, data) => this.handleModelUpdate(event, data));

        const messages = this.model.getAllMessages();
        this.view.renderMessages(messages);
        this.view.updateMessageCount(this.model.getMessageCount());

        this.loadSettings();

        this.bindEvents();
    }

    bindEvents() {
        const elements = this.view.getElements();

        elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleSendMessage();
            return false;
        });

        elements.exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleExport();
        });

        elements.importBtn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.importFile.click();
        });

        elements.importFile.addEventListener('change', (e) => {
            this.handleImport(e);
        });

        elements.clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleClearHistory();
        });

        elements.settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleOpenSettings();
        });

        elements.messagesContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-small');
            if (!button) return;

            e.preventDefault();
            const action = button.dataset.action;
            const messageId = button.dataset.messageId;

            if (action === 'edit') {
                this.handleEditMessage(messageId);
            } else if (action === 'delete') {
                this.handleDeleteMessage(messageId);
            }
        });

        console.log('All event listeners bound successfully');
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

    async handleSendMessage() {
        console.log('handleSendMessage called');

        const elements = this.view.getElements();
        const text = elements.input.value.trim();

        if (!text) {
            console.log('Empty message, ignoring');
            return;
        }

        console.log('Sending message:', text);

        this.model.addMessage(text, true);
        elements.input.value = '';

        this.view.showTypingIndicator();

        try {
            const service = this.serviceFactory.getCurrentService();
            console.log('Using service:', service.getName());

            const botResponse = await service.getResponse(text);
            console.log('Got response:', botResponse);

            this.view.hideTypingIndicator();
            this.model.addMessage(botResponse, false);

        } catch (error) {
            this.view.hideTypingIndicator();
            console.error('AI service error:', error);

            const errorMsg = `Sorry, I encountered an error: ${error.message}`;
            this.model.addMessage(errorMsg, false);

            if (this.currentServiceId === 'gemini') {
                setTimeout(() => {
                    if (confirm('Gemini is having issues. Would you like to switch to Eliza?')) {
                        this.switchToService('eliza');
                    }
                }, 500);
            }
        }
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
            () => {}
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
                this.model.importData(data);
            } catch (error) {
                alert(`Import failed: ${error.message}`);
            }
        };

        reader.onerror = () => {
            alert('Failed to read file');
        };

        reader.readAsText(file);
    }

    handleOpenSettings() {
        console.log('Opening settings');
        const availableServices = this.serviceFactory.getAvailableServices();
        const currentApiKey = this.serviceFactory.getService('gemini').apiKey || '';

        this.view.showSettingsModal(
            availableServices,
            this.currentServiceId,
            currentApiKey,
            (serviceId, apiKey) => this.handleSaveSettings(serviceId, apiKey)
        );
    }

    handleSaveSettings(serviceId, apiKey) {
        console.log('Saving settings:', serviceId);

        if (apiKey) {
            this.serviceFactory.setGeminiApiKey(apiKey);
            localStorage.setItem('gemini-api-key', apiKey);
        }

        this.switchToService(serviceId);

        localStorage.setItem('ai-service', serviceId);

        this.view.closeSettingsModal();
    }

    switchToService(serviceId) {
        try {
            const service = this.serviceFactory.switchService(serviceId);
            this.currentServiceId = serviceId;
            this.view.updateServiceIndicator(service.getName());
            console.log(`Switched to ${service.getName()}`);
        } catch (error) {
            alert(`Failed to switch service: ${error.message}`);
        }
    }

    loadSettings() {
        const savedApiKey = localStorage.getItem('gemini-api-key');
        if (savedApiKey) {
            this.serviceFactory.setGeminiApiKey(savedApiKey);
            console.log('Loaded saved API key');
        }

        const savedService = localStorage.getItem('ai-service');
        if (savedService && (savedService === 'eliza' || savedService === 'gemini')) {
            this.switchToService(savedService);
        } else {
            this.switchToService('eliza');
        }
    }
}

export default ChatController;