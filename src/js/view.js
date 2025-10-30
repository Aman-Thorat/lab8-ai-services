class ChatView {
    constructor() {
        this.messagesContainer = document.getElementById('chat-messages');
        this.messageCountEl = document.getElementById('message-count');
        this.lastSavedEl = document.getElementById('last-saved');
        this.emptyState = this.messagesContainer.querySelector('.empty-state');
    }

    renderMessages(messages) {
        const existingMessages = this.messagesContainer.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        if (messages.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
            messages.forEach(message => this.renderMessage(message));
            this.scrollToBottom();
        }
    }

    renderMessage(message) {
        this.hideEmptyState();

        const messageEl = this.createMessageElement(message);
        this.messagesContainer.appendChild(messageEl);
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isUser ? 'user' : 'bot'}`;
        messageDiv.dataset.messageId = message.id;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = message.isUser ? 'U' : 'E';
        avatar.setAttribute('aria-label', message.isUser ? 'User' : 'Eliza');

        const content = document.createElement('div');
        content.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = message.text;

        const meta = document.createElement('div');
        meta.className = 'message-meta';

        const time = document.createElement('span');
        time.textContent = this.formatTimestamp(message.timestamp);
        meta.appendChild(time);

        if (message.edited) {
            const edited = document.createElement('span');
            edited.className = 'edited-indicator';
            edited.textContent = '(edited)';
            meta.appendChild(edited);
        }

        content.appendChild(bubble);
        content.appendChild(meta);

        if (message.isUser) {
            const actions = this.createActionButtons(message.id);
            content.appendChild(actions);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        return messageDiv;
    }

    createActionButtons(messageId) {
        const actions = document.createElement('div');
        actions.className = 'message-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-small edit';
        editBtn.textContent = 'Edit';
        editBtn.dataset.action = 'edit';
        editBtn.dataset.messageId = messageId;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.dataset.action = 'delete';
        deleteBtn.dataset.messageId = messageId;

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        return actions;
    }

    updateMessage(message) {
        const messageEl = this.messagesContainer.querySelector(`[data-message-id="${message.id}"]`);
        if (messageEl) {
            const newMessageEl = this.createMessageElement(message);
            messageEl.replaceWith(newMessageEl);
        }
    }

    removeMessage(messageId) {
        const messageEl = this.messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (messageEl) {
            messageEl.remove();
        }

        const remainingMessages = this.messagesContainer.querySelectorAll('.message');
        if (remainingMessages.length === 0) {
            this.showEmptyState();
        }
    }

    showEditForm(messageId, currentText, onSave, onCancel) {
        const messageEl = this.messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageEl) return;

        const content = messageEl.querySelector('.message-content');
        const bubble = content.querySelector('.message-bubble');
        const actions = content.querySelector('.message-actions');

        bubble.style.display = 'none';
        actions.style.display = 'none';

        const form = document.createElement('form');
        form.className = 'edit-form';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.required = true;

        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.className = 'save';
        saveBtn.textContent = 'Save';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'cancel';
        cancelBtn.textContent = 'Cancel';

        form.appendChild(input);
        form.appendChild(saveBtn);
        form.appendChild(cancelBtn);

        content.appendChild(form);

        input.focus();
        input.select();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newText = input.value.trim();
            if (newText) {
                onSave(messageId, newText);
            }
        });

        cancelBtn.addEventListener('click', () => {
            form.remove();
            bubble.style.display = '';
            actions.style.display = '';
            onCancel();
        });
    }

    updateMessageCount(count) {
        this.messageCountEl.textContent = `${count} message${count !== 1 ? 's' : ''}`;
    }

    updateLastSaved(timestamp) {
        const date = new Date(timestamp);
        this.lastSavedEl.textContent = `Last saved: ${date.toLocaleTimeString()}`;
    }

    clearMessages() {
        const messages = this.messagesContainer.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
        this.showEmptyState();
    }

    showEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'block';
        }
    }

    hideEmptyState() {
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showTypingIndicator() {
        const existing = this.messagesContainer.querySelector('.typing-indicator');
        if (existing) return;

        const indicator = document.createElement('div');
        indicator.className = 'message bot typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">E</div>
            <div class="message-content">
                <div class="message-bubble">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = this.messagesContainer.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    updateServiceIndicator(serviceName) {
        const indicator = document.getElementById('service-indicator');
        if (indicator) {
            indicator.textContent = `Using: ${serviceName}`;
        }
    }

    showSettingsModal(services, currentServiceId, currentApiKey, onSave) {
        const modal = document.createElement('dialog');
        modal.id = 'settings-modal';
        modal.className = 'settings-modal';

        modal.innerHTML = `
            <form method="dialog">
                <h2>Settings</h2>
                
                <label for="service-select">AI Service:</label>
                <select id="service-select">
                    ${services.map(s =>
            `<option value="${s.id}" ${s.id === currentServiceId ? 'selected' : ''}>${s.name}</option>`
        ).join('')}
                </select>
                
                <div id="api-key-section" style="display: none;">
                    <label for="api-key-input">Gemini API Key:</label>
                    <input type="password" id="api-key-input" value="${currentApiKey}" placeholder="Enter your Gemini API key">
                    <small>Get one at: <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a></small>
                </div>
                
                <div class="modal-actions">
                    <button type="button" id="save-settings-btn">Save</button>
                    <button type="button" id="cancel-settings-btn">Cancel</button>
                </div>
            </form>
        `;

        document.body.appendChild(modal);
        modal.showModal();

        const select = modal.querySelector('#service-select');
        const apiKeySection = modal.querySelector('#api-key-section');
        const apiKeyInput = modal.querySelector('#api-key-input');

        const toggleApiKeySection = () => {
            apiKeySection.style.display = select.value === 'gemini' ? 'block' : 'none';
        };

        toggleApiKeySection();
        select.addEventListener('change', toggleApiKeySection);

        modal.querySelector('#save-settings-btn').addEventListener('click', () => {
            const serviceId = select.value;
            const apiKey = apiKeyInput.value.trim();

            if (serviceId === 'gemini' && !apiKey) {
                alert('Please enter a Gemini API key');
                return;
            }

            onSave(serviceId, apiKey);
        });

        modal.querySelector('#cancel-settings-btn').addEventListener('click', () => {
            modal.close();
            modal.remove();
        });

        modal.addEventListener('close', () => {
            modal.remove();
        });
    }

    closeSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.close();
            modal.remove();
        }
    }

    getElements() {
        return {
            form: document.getElementById('chat-form'),
            input: document.getElementById('message-input'),
            exportBtn: document.getElementById('export-btn'),
            importBtn: document.getElementById('import-btn'),
            importFile: document.getElementById('import-file'),
            clearBtn: document.getElementById('clear-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            messagesContainer: this.messagesContainer
        };
    }
}

export default ChatView;