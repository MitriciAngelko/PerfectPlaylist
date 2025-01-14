import SpotifyApiService from '../services/SpotifyApiService.js';
import PlayerView from '../views/PlayerView.js';

class PlayerController {
    constructor(apiService) {
        this.apiService = apiService;
        this.view = new PlayerView();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.view.onPlayPause(() => this.togglePlayPause());
        this.view.onNext(() => this.skipToNext());
        this.view.onPrevious(() => this.skipToPrevious());
    }

    async togglePlayPause() {
        // Implementare...
    }
}

export default PlayerController; 