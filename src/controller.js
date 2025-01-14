class SpotifyController {
    constructor() {
        this.access_token = localStorage.getItem('spotify_access_token');
        this.user_id = null;
        this.songsdisplayed = false;
        this.artistsdisplayed = false;
        this.time_range = 'short_term';
        this.time_range_display = 'last 4 weeks';
        this.playlist_uris = [];
        this.limit = '20';
        this.isPlaying = false;
    }

    authorize() {
        const client_id = 'f9fa57a16b964585981ff4bffd1fb46f';
        const redirect_uri = 'http://localhost:5173';
        const scopes = 'user-top-read playlist-modify-public playlist-modify-private user-read-currently-playing user-modify-playback-state user-read-playback-state user-library-read playlist-read-private playlist-read-collaborative';

        let url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(client_id);
        url += '&scope=' + encodeURIComponent(scopes);
        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
        
        window.location = url;
    }

    async getUserProfile() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const response = await $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + this.access_token
                }
            });

            this.user_id = response.id;
            return {
                id: response.id,
                displayName: response.display_name,
                profileImage: response.images?.[0]?.url
            };
        } catch (error) {
            throw error;
        }
    }

    async getTopArtists() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const response = await $.ajax({
                url: 'https://api.spotify.com/v1/me/top/artists',
                data: {
                    limit: this.limit,
                    time_range: this.time_range,
                },
                headers: {
                    'Authorization': 'Bearer ' + this.access_token,
                }
            });

            this.artistsdisplayed = true;
            this.songsdisplayed = false;
            return response.items;
        } catch (error) {
            throw error;
        }
    }

    async getTopTracks() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const response = await $.ajax({
                url: 'https://api.spotify.com/v1/me/top/tracks',
                data: {
                    limit: this.limit,
                    time_range: this.time_range,
                },
                headers: {
                    'Authorization': 'Bearer ' + this.access_token,
                }
            });

            this.playlist_uris = response.items.map(item => item.uri);
            this.songsdisplayed = true;
            this.artistsdisplayed = false;
            return response.items;
        } catch (error) {
            throw error;
        }
    }

    async getCurrentlyPlaying() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const response = await $.ajax({
                url: 'https://api.spotify.com/v1/me/player/currently-playing',
                headers: {
                    'Authorization': 'Bearer ' + this.access_token
                }
            });

            if (response?.item) {
                this.isPlaying = response.is_playing;
                return {
                    name: response.item.name,
                    artist: response.item.artists[0].name,
                    image: response.item.album.images[0].url,
                    isPlaying: response.is_playing
                };
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    async createPlaylist(timeRangeText) {
        if (!this.access_token || !this.user_id) {
            throw new Error('No access token or user ID available');
        }

        try {
            const playlistName = `Perfect Playlist - ${timeRangeText}`;
            
            const playlist = await this.createNewPlaylist(playlistName);
            const artistIds = await this.getTopArtistIds();
            const trackUris = await this.getArtistsTopTracks(artistIds);
            await this.addTracksToPlaylist(playlist.id, trackUris);

            return playlist;
        } catch (error) {
            throw error;
        }
    }

    async createNewPlaylist(name) {
        const response = await fetch(`https://api.spotify.com/v1/users/${this.user_id}/playlists`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.access_token}`,
            },
            body: JSON.stringify({
                name: name,
                description: "This playlist has been created using PerfectPlaylist.",
                public: true
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    }

    setTimeRange(range) {
        this.time_range = range;
        switch (range) {
            case 'short_term':
                this.time_range_display = 'last 4 weeks';
                break;
            case 'medium_term':
                this.time_range_display = 'last 6 months';
                break;
            case 'long_term':
                this.time_range_display = 'all time';
                break;
        }
    }

    setLimit(newLimit) {
        this.limit = newLimit.toString();
    }

    setAccessToken(token) {
        this.access_token = token;
        localStorage.setItem('spotify_access_token', token);
    }

    clearAccessToken() {
        this.access_token = null;
        localStorage.removeItem('spotify_access_token');
    }

    async togglePlayPause() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const state = await this.getCurrentPlaybackState();
            const endpoint = state?.isPlaying ? 'pause' : 'play';
            
            const response = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });

            if (response.status === 404) {
                throw new Error('No active device found');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to toggle playback');
            }

            this.isPlaying = !state?.isPlaying;
            return this.isPlaying;
        } catch (error) {
            console.error('Error in togglePlayPause:', error);
            throw error;
        }
    }

    async skipToNext() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/next', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });

            if (response.status === 404) {
                throw new Error('No active device found');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to skip to next track');
            }

            return true;
        } catch (error) {
            console.error('Error in skipToNext:', error);
            throw error;
        }
    }

    async skipToPrevious() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });

            if (response.status === 404) {
                throw new Error('No active device found');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to skip to previous track');
            }

            return true;
        } catch (error) {
            console.error('Error in skipToPrevious:', error);
            throw error;
        }
    }

    async getCurrentPlaybackState() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player', {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });

            if (!response.ok) {
                throw response;
            }

            if (response.status === 204) {
                return null;
            }

            const data = await response.json();
            const track = data.item;
            return {
                currentTrack: track,
                isPlaying: data.is_playing,
                context_uri: data.context ? data.context.uri : null,
                currentTrackUri: track.uri
            };
        } catch (error) {
            throw error;
        }
    }

    async getCurrentPlaylistTracks() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player', {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch current playback state');
            }

            const data = await response.json();
            if (!data || !data.context || !data.item) {
                return null;
            }

            // Extragem playlist ID din URI-ul contextului
            const playlistId = data.context.uri.split(':').pop();

            let allTracks = [];
            let offset = 0;
            const limit = 100;
            let hasMoreTracks = true;

            while (hasMoreTracks) {
                const response = await fetch(
                    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.access_token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch playlist tracks');
                }

                const data = await response.json();
                allTracks = allTracks.concat(data.items);

                if (data.items.length < limit) {
                    hasMoreTracks = false;
                } else {
                    offset += limit;
                }
            }

            return {
                tracks: allTracks,
                currentTrackUri: data.item.uri,
                context_uri: data.context.uri,
                playlist_uri: `spotify:playlist:${playlistId}`
            };
        } catch (error) {
            console.error('Error in getCurrentPlaylistTracks:', error);
            throw error;
        }
    }

    async handleApiCall(apiCall) {
        try {
            return await apiCall();
        } catch (error) {
            if (error.status === 401) {
                this.clearAccessToken();
                window.location.href = '/index.html#error=token_expired';
            }
            throw error;
        }
    }

    async checkTokenValidity() {
        if (!this.access_token) {
            return false;
        }
        
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });
            
            if (response.status === 401) {
                this.clearAccessToken();
                return false;
            }
            
            return response.ok;
        } catch (error) {
            console.error('Error checking token validity:', error);
            return false;
        }
    }

    async playTrack(uri, context_uri = null) {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            // Verificăm device-ul activ
            const deviceResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });
            
            const deviceData = await deviceResponse.json();
            if (!deviceData.devices || deviceData.devices.length === 0) {
                throw new Error('No active devices found. Please open Spotify on a device.');
            }

            // Construim body-ul pentru request
            let body;
            if (context_uri && context_uri !== 'undefined' && context_uri !== '') {
                // Dacă avem context_uri (playlist), folosim offset pentru a începe de la melodia selectată
                body = {
                    context_uri: context_uri,
                    offset: { uri: uri },
                    position_ms: 0
                };
            } else {
                // Dacă nu avem context, redăm doar melodia selectată
                body = {
                    uris: [uri]
                };
            }

            console.log('Playing track with body:', body);

            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to play track');
            }

            // Actualizăm starea UI-ului
            this.currentTrackUri = uri;
            this.currentContextUri = context_uri;
        } catch (error) {
            console.error('Error playing track:', error);
            throw error;
        }
    }

    async getUserPlaylists() {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch playlists');
            }

            const data = await response.json();
            return data.items;
        } catch (error) {
            throw error;
        }
    }

    async getPlaylistTracks(playlistId) {
        if (!this.access_token) {
            throw new Error('No access token available');
        }

        try {
            let tracks = [];
            let offset = 0;
            const limit = 100; // Limita maximă per request
            let hasMoreTracks = true;

            while (hasMoreTracks) {
                const response = await fetch(
                    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.access_token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch playlist tracks');
                }

                const data = await response.json();
                const validTracks = data.items
                    .filter(item => item.track !== null)
                    .map(item => item.track);
                
                tracks = tracks.concat(validTracks);

                if (data.items.length < limit) {
                    hasMoreTracks = false;
                } else {
                    offset += limit;
                }
            }

            return tracks;
        } catch (error) {
            console.error('Error fetching playlist tracks:', error);
            throw error;
        }
    }

    async getPlaylist(playlistId) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch playlist');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching playlist:', error);
            throw error;
        }
    }

    async toggleShuffle() {
        try {
            const currentState = await this.getPlaybackState();
            const newState = !currentState.shuffle_state;
            
            await fetch('https://api.spotify.com/v1/me/player/shuffle?state=' + newState, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });
            
            return newState;
        } catch (error) {
            console.error('Error toggling shuffle:', error);
            throw error;
        }
    }

    async toggleRepeat() {
        try {
            const currentState = await this.getPlaybackState();
            const states = ['off', 'context', 'track'];
            const currentIndex = states.indexOf(currentState.repeat_state);
            const nextState = states[(currentIndex + 1) % states.length];
            
            await fetch('https://api.spotify.com/v1/me/player/repeat?state=' + nextState, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });
            
            return nextState;
        } catch (error) {
            console.error('Error toggling repeat:', error);
            throw error;
        }
    }

    async addToQueue(uri) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${uri}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to add to queue');
            }
        } catch (error) {
            console.error('Error adding to queue:', error);
            throw error;
        }
    }
}

export default SpotifyController; 