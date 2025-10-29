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

    getElements() {
        return {
            form: document.getElementById('chat-form'),
            input: document.getElementById('message-input'),
            exportBtn: document.getElementById('export-btn'),
            importBtn: document.getElementById('import-btn'),
            importFile: document.getElementById('import-file'),
            clearBtn: document.getElementById('clear-btn'),
            messagesContainer: this.messagesContainer
        };
    }
}

export default ChatView;