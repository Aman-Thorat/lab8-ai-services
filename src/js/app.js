import ChatModel from './model.js';
import ChatView from './view.js';
import ChatController from './controller.js';

document.addEventListener('DOMContentLoaded', () => {
    const model = new ChatModel();
    const view = new ChatView();
    const controller = new ChatController(model, view);

    console.log('Chat application initialized with MVC architecture');
});