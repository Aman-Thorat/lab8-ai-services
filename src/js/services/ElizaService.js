import AIService from './AIService.js';
import { getElizaResponse } from '../eliza.js';

class ElizaService extends AIService {
    constructor() {
        super('Eliza (Local)');
    }

    async getResponse(message) {
        // Simulate slight delay to match real API feel
        await new Promise(resolve => setTimeout(resolve, 100));
        return getElizaResponse(message);
    }

    isConfigured() {
        return true;
    }
}

export default ElizaService;