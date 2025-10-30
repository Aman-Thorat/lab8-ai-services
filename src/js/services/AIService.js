class AIService {
    constructor(name) {
        if (new.target === AIService) {
            throw new Error('AIService is an abstract class and cannot be instantiated directly');
        }
        this.name = name;
    }

    async getResponse(message, context = []) {
        throw new Error('getResponse() must be implemented by subclass');
    }

    isConfigured() {
        throw new Error('isConfigured() must be implemented by subclass');
    }

    getName() {
        return this.name;
    }
}

export default AIService;