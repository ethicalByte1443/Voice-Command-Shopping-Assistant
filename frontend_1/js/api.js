// API Communication Module
class APIClient {
    constructor(baseURL = 'http://127.0.0.1:8000') {
        this.baseURL = baseURL;
        this.timeout = 30000; // 30 seconds
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            timeout: this.timeout,
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        // Add timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }

    async uploadAudio(audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseURL}/recognise_text_to_llm`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Upload timeout');
            }
            
            throw error;
        }
    }

    async getWishlist(username) {
        return this.request(`/wishlist/${username}`);
    }

    async updateWishlist(username, action) {
        return this.request(`/update_wishlist/${username}`, {
            method: 'POST',
            body: JSON.stringify(action)
        });
    }

    async getRecommendations(username) {
        return this.request(`/recommendations/${username}`);
    }
}

// Export for use in other modules
window.APIClient = APIClient;