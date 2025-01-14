import SpotifyController from './controller.js';

const spotifyController = new SpotifyController();

function updatePlayPauseButton(isPlaying) {
    const icon = $('#play-pause-button i');
    if (isPlaying) {
        icon.removeClass('play').addClass('pause');
    } else {
        icon.removeClass('pause').addClass('play');
    }
}

async function updateCurrentTrack() {
    try {
        const playbackState = await spotifyController.getCurrentPlaybackState();
        if (playbackState && playbackState.currentTrack) {
            const track = playbackState.currentTrack;
            $('#current-track-img').attr('src', track.album.images[0].url);
            $('#current-track-name').text(track.name);
            $('#current-track-artist').text(track.artists.map(a => a.name).join(', '));
            updatePlayPauseButton(playbackState.isPlaying);
        }
    } catch (error) {
        console.error('Error updating current track:', error);
        if (error.status === 401) {
            window.location.href = '../index.html#error=token_expired';
        }
    }
}

async function updatePlaylist() {
    try {
        const playlistData = await spotifyController.getCurrentPlaylistTracks();
        if (playlistData) {
            const tracksHtml = playlistData.tracks.map(item => {
                const track = item.track;
                const isActive = track.uri === playlistData.currentTrackUri;
                return `
                    <div class="playlist-track ${isActive ? 'active' : ''}" 
                         data-uri="${track.uri}"
                         data-context-uri="${playlistData.playlist_uri}">
                        <img src="${track.album.images[track.album.images.length-1].url}" alt="${track.name}">
                        <div class="track-info">
                            <div class="title">${track.name}</div>
                            <div class="artist">${track.artists.map(a => a.name).join(', ')}</div>
                        </div>
                    </div>
                `;
            }).join('');
            $('#playlist-tracks').html(tracksHtml);
            
            $('.playlist-track').on('click', async function() {
                const trackUri = $(this).data('uri');
                const contextUri = $(this).data('context-uri');
                try {
                    await spotifyController.playTrack(trackUri, contextUri);
                    setTimeout(async () => {
                        await updateCurrentTrack();
                        await updatePlaylist();
                    }, 200);
                } catch (error) {
                    console.error('Error playing track:', error);
                    showError(error.message);
                }
            });
        } else {
            $('#playlist-tracks').html('<p>No playlist currently playing</p>');
        }
    } catch (error) {
        console.error('Error updating playlist:', error);
    }
}

function setupPlayerControls() {
    $('#play-pause-button').on('click', async () => {
        try {
            const isPlaying = await spotifyController.togglePlayPause();
            updatePlayPauseButton(isPlaying);
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    });

    $('#next-button').on('click', async () => {
        try {
            await spotifyController.skipToNext();
            setTimeout(() => {
                updateCurrentTrack();
                updatePlaylist();
            }, 200);
        } catch (error) {
            console.error('Error skipping to next:', error);
        }
    });

    $('#prev-button').on('click', async () => {
        try {
            await spotifyController.skipToPrevious();
            setTimeout(() => {
                updateCurrentTrack();
                updatePlaylist();
            }, 200);
        } catch (error) {
            console.error('Error skipping to previous:', error);
        }
    });
}

async function loadPlaylists() {
    try {
        const playlists = await spotifyController.getUserPlaylists();
        const playlistsGrid = document.getElementById('playlists-grid');
        playlistsGrid.innerHTML = playlists.items.map(playlist => `
            <div class="playlist-item" data-playlist-id="${playlist.id}">
                <img src="${playlist.images[0]?.url || 'default-playlist.png'}" alt="${playlist.name}">
                <div class="playlist-item-info">
                    <h3>${playlist.name}</h3>
                    <p>${playlist.tracks.total} tracks</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading playlists:', error);
        showError('Failed to load playlists');
    }
}

function setupEventListeners() {
    $('#shuffle-button').on('click', async function() {
        try {
            const isShuffleOn = await spotifyController.toggleShuffle();
            $(this).toggleClass('active', isShuffleOn);
        } catch (error) {
            console.error('Error toggling shuffle:', error);
            showError('Failed to toggle shuffle');
        }
    });

    $('#repeat-button').on('click', async function() {
        try {
            const repeatState = await spotifyController.toggleRepeat();
            $(this).toggleClass('active', repeatState !== 'off');
            const icon = $(this).find('i');
            if (repeatState === 'track') {
                icon.addClass('one');
            } else {
                icon.removeClass('one');
            }
        } catch (error) {
            console.error('Error toggling repeat:', error);
            showError('Failed to toggle repeat');
        }
    });
}

$(document).ready(async function() {
    try {
        await initializePlayer();
        await loadPlaylists();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing:', error);
        window.location.href = '../index.html#error=initialization_failed';
    }
}); 