import ElizaService from './ElizaService.js';
import GeminiService from './GeminiService.js';

class ServiceFactory {
    constructor() {
        this.services = {
            eliza: new ElizaService(),
            gemini: new GeminiService()
        };
        this.currentService = this.services.eliza;
    }

    getAvailableServices() {
        return [
            { id: 'eliza', name: 'Eliza (Local)' },
            { id: 'gemini', name: 'Gemini 1.5 Flash' }
        ];
    }

    getCurrentService() {
        return this.currentService;
    }

    switchService(serviceId) {
        if (!this.services[serviceId]) {
            throw new Error(`Unknown service: ${serviceId}`);
        }
        this.currentService = this.services[serviceId];
        return this.currentService;
    }

    getService(serviceId) {
        return this.services[serviceId];
    }

    setGeminiApiKey(apiKey) {
        this.services.gemini.setApiKey(apiKey);
    }
}

export default ServiceFactory;