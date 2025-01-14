class SpotifyApiService {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://api.spotify.com/v1';
    }

    async fetchWithAuth(endpoint, options = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        return response.json();
    }
}

export default SpotifyApiService; 