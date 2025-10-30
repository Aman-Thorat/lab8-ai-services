import AIService from './AIService.js';

class GeminiService extends AIService {
    constructor(apiKey = null) {
        super('Gemini 1.5 Flash');
        this.apiKey = apiKey;
        this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    async getResponse(message) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API key is not configured');
        }

        try {
            const response = await fetch(
                `${this.endpoint}?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: message }]
                        }]
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Gemini API request failed');
            }

            const data = await response.json();

            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!aiResponse) {
                throw new Error('Invalid response format from Gemini');
            }

            return aiResponse;

        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error(`Gemini error: ${error.message}`);
        }
    }

    isConfigured() {
        return !!this.apiKey && this.apiKey.length > 0;
    }
}

export default GeminiService;