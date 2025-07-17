// ===== WARM BRUTALIST AUDIO STUDIO INTERFACE =====
// Perfect Playlist - Professional Audio Interface

let currentUser = null;
let accessToken = null;
let currentPlaylist = null;

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', function() {
    initializeStudio();
    checkAuthState();
    updateUserInterface(); // <-- adăugat aici
    setupStudioControls();
    setupNavigationHandlers();
    setupSliderControls();
    setupEQControls();
});

// ===== STUDIO INITIALIZATION =====
function initializeStudio() {
    console.log('🎛️ Initializing Audio Studio Interface...');
    
    // Initialize studio components
    initializeSliders();
    initializeEQBands();
    initializeMoodMapping();
    initializeTransportControls();
    
    console.log('✅ Studio interface ready');
}

// ===== NAVIGATION SYSTEM =====
function setupNavigationHandlers() {
    const navTiles = document.querySelectorAll('.nav-tile');
    
    navTiles.forEach(tile => {
        tile.addEventListener('click', function() {
            const targetView = this.dataset.view;
            if (targetView) {
                switchStudioView(targetView);
                updateActiveNavigation(this);
            }
        });
    });
}

function switchStudioView(viewName) {
    console.log(`🎛️ Switching to ${viewName.toUpperCase()} view`);
    
    // Hide all content panels
    const panels = document.querySelectorAll('.content-panel');
    panels.forEach(panel => panel.classList.remove('active'));
    
    // Show target panel
    const targetPanel = document.getElementById(`${viewName}-view`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}

function updateActiveNavigation(activeButton) {
    // Remove active class from all nav tiles
    document.querySelectorAll('.nav-tile').forEach(tile => {
        tile.classList.remove('active');
    });
    
    // Add active class to clicked tile
    activeButton.classList.add('active');
}

// ===== STUDIO CONTROLS =====
function setupStudioControls() {
    // Analysis period buttons
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Sound presets
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            console.log(`🔊 Audio preset: ${this.textContent}`);
        });
    });
    
    // Mood mapping
    const moodPoints = document.querySelectorAll('.mood-point');
    moodPoints.forEach(point => {
        point.addEventListener('click', function() {
            document.querySelectorAll('.mood-point').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            console.log(`🎭 Mood selected: ${this.textContent}`);
        });
    });
    
    // Sequence controls
    const sequenceButtons = document.querySelectorAll('.sequence-btn');
    sequenceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            console.log(`🔄 Sequence control: ${this.textContent} ${this.classList.contains('active') ? 'ON' : 'OFF'}`);
        });
    });
    
    // Context options
    const contextOptions = document.querySelectorAll('.context-option');
    contextOptions.forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.context-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            console.log(`🎯 Context: ${this.textContent}`);
        });
    });
}

// ===== SLIDER CONTROLS =====
function setupSliderControls() {
    // Studio fader (sample size)
    const studioFader = document.getElementById('numResponses');
    if (studioFader) {
        const display = document.getElementById('number');
        
        studioFader.addEventListener('input', function() {
            if (display) {
                display.textContent = this.value;
            }
            console.log(`🎚️ Sample size: ${this.value} tracks`);
        });
    }
    
    // Spatial processing sliders
    const spatialSliders = document.querySelectorAll('.spatial-slider');
    spatialSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const label = this.previousElementSibling.textContent;
            console.log(`🌊 ${label}: ${this.value}%`);
        });
    });
}

// ===== EQ CONTROLS =====
function setupEQControls() {
    const eqSliders = document.querySelectorAll('.eq-slider');
    
    eqSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const frequency = this.dataset.freq;
            const value = this.value;
            const valueDisplay = this.parentElement.querySelector('.band-value');
            
            if (valueDisplay) {
                valueDisplay.textContent = value > 0 ? `+${value}` : value;
            }
            
            console.log(`🎛️ EQ ${frequency}: ${value}dB`);
        });
    });
}

function initializeEQBands() {
    const eqSliders = document.querySelectorAll('.eq-slider');
    eqSliders.forEach(slider => {
        const valueDisplay = slider.parentElement.querySelector('.band-value');
        if (valueDisplay) {
            valueDisplay.textContent = '0';
        }
    });
}

// ===== TRANSPORT CONTROLS =====
function initializeTransportControls() {
    const prevBtn = document.getElementById('prev-button');
    const playPauseBtn = document.getElementById('play-pause-button');
    const nextBtn = document.getElementById('next-button');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => console.log('⏮️ Previous track'));
    }
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            const icon = playPauseBtn.querySelector('i');
            if (icon.classList.contains('fa-play')) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                console.log('▶️ Play');
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                console.log('⏸️ Pause');
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => console.log('⏭️ Next track'));
    }
}

// ===== SLIDER INITIALIZATION =====
function initializeSliders() {
    // Initialize fader displays
    const faders = document.querySelectorAll('.studio-fader');
    faders.forEach(fader => {
        const container = fader.closest('.fader-container');
        if (container) {
            const display = container.querySelector('.fader-display span:first-child');
            if (display && !display.textContent) {
                display.textContent = fader.value;
            }
        }
    });
}

// ===== MOOD MAPPING =====
function initializeMoodMapping() {
    const moodPoints = document.querySelectorAll('.mood-point');
    if (moodPoints.length > 0) {
        // Set first mood as default active
        moodPoints[0].classList.add('active');
    }
}

// ===== AUTHENTICATION =====
function checkAuthState() {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    
    if (authCode && !accessToken) {
        console.log('🔐 Processing authentication...');
        exchangeCodeForToken(authCode);
    } else {
        const storedToken = localStorage.getItem('spotify_access_token');
        if (storedToken) {
            accessToken = storedToken;
            getCurrentUser();
        }
    }
}

function initiateAuth() {
    console.log('🎧 Initiating Spotify connection...');
    
    const clientId = 'f9fa57a16b964585981ff4bffd1fb46f'; // Client ID corect
    const redirectUri = 'http://localhost:5173'; // Redirect URI exact ca în dashboard
    const scopes = [
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-top-read',
        'user-read-recently-played'
    ].join(' ');
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `show_dialog=true`;
    
    window.location.href = authUrl;
}

async function exchangeCodeForToken(code) {
    try {
        const client_id = 'f9fa57a16b964585981ff4bffd1fb46f';
        const client_secret = 'e3f8bafe338a4a51aea1ada4670117d3';
        const redirect_uri = 'http://localhost:5173'; // asigură-te că e identic cu cel din dashboard Spotify
        const basic = btoa(`${client_id}:${client_secret}`);
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basic}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri
            })
        });
        
        const data = await response.json();
        
        if (data.access_token) {
            accessToken = data.access_token;
            localStorage.setItem('spotify_access_token', accessToken);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('✅ Authentication successful');
            getCurrentUser();
        } else {
            showError('Authentication failed. Please try again.');
            console.error('❌ Authentication failed:', data);
        }
    } catch (error) {
        console.error('❌ Authentication failed:', error);
        showError('Authentication failed. Please try again.');
    }
}

async function getCurrentUser() {
    if (!accessToken) return;
    
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (response.status === 401) {
            console.log('🔄 Token expired, please reconnect');
            logout();
            return;
        }
        
        currentUser = await response.json();
        updateUserInterface();
        loadUserPlaylists();
        
        console.log(`👤 Welcome, ${currentUser.display_name}`);
    } catch (error) {
        console.error('❌ Failed to get user info:', error);
        logout();
    }
}

function updateUserInterface() {
    const loginSection = document.getElementById('login');
    const profileSection = document.getElementById('profile');
    
    if (currentUser && accessToken) {
        // Show profile
        profileSection.style.display = 'flex';
        loginSection.style.display = 'none';
        
        // Update profile info
        const profilePic = document.getElementById('user-profile-pic');
        const userName = document.getElementById('user-name-text');
        
        if (profilePic && currentUser.images && currentUser.images.length > 0) {
            profilePic.src = currentUser.images[0].url;
        }
        
        if (userName) {
            userName.textContent = currentUser.display_name || 'Audiophile';
        }
        
        // Setup logout button
        const logoutBtn = document.getElementById('logout-button');
        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
            logoutBtn.onclick = logout;
        }
    } else {
        // Show login
        profileSection.style.display = 'none';
        loginSection.style.display = 'flex';
        
        // Setup login button
        const loginBtn = document.getElementById('login-button');
        if (loginBtn) {
            loginBtn.onclick = initiateAuth;
        }
    }
}

function logout() {
    console.log('👋 Disconnecting from Spotify...');
    
    accessToken = null;
    currentUser = null;
    currentPlaylist = null;
    
    localStorage.removeItem('spotify_access_token');
    updateUserInterface();
    clearResults();
    clearPlaylists();
    
    console.log('✅ Disconnected successfully');
}

// ===== SPOTIFY API FUNCTIONS =====
async function loadUserPlaylists() {
    if (!accessToken) return;
    
    try {
        console.log('📁 Loading playlists...');
        const playlistsGrid = document.getElementById('playlists-grid');
        if (!playlistsGrid) return;
        
        showLoading(playlistsGrid);
        
        const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        displayPlaylists(data.items);
        
        console.log(`✅ Loaded ${data.items.length} playlists`);
    } catch (error) {
        console.error('❌ Failed to load playlists:', error);
        showError('Failed to load playlists. Please try again.');
        hideLoading(document.getElementById('playlists-grid'));
    }
}

function displayPlaylists(playlists) {
    const playlistsGrid = document.getElementById('playlists-grid');
    if (!playlistsGrid) return;
    
    // Clear loading state first
    hideLoading(playlistsGrid);
    playlistsGrid.innerHTML = '';
    
    if (!playlists || playlists.length === 0) {
        playlistsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-music"></i>
                </div>
                <span class="empty-text">NO PLAYLISTS FOUND</span>
                <p class="empty-desc">Create some playlists in Spotify to see them here</p>
            </div>
        `;
        return;
    }
    
    playlists.forEach(playlist => {
        const playlistElement = createPlaylistElement(playlist);
        playlistsGrid.appendChild(playlistElement);
    });
}

function createPlaylistElement(playlist) {
    const playlistDiv = document.createElement('div');
    playlistDiv.className = 'playlist-item';
    
    const imageUrl = playlist.images && playlist.images.length > 0 
        ? playlist.images[0].url 
        : 'src/logo.png';
    
    playlistDiv.innerHTML = `
        <img src="${imageUrl}" alt="${playlist.name}" onerror="this.src='src/logo.png'">
        <div class="playlist-item-info">
            <h3>${playlist.name}</h3>
            <p>${playlist.tracks.total} tracks • ${playlist.public ? 'Public' : 'Private'}</p>
        </div>
    `;
    
    // Add click handler
    playlistDiv.addEventListener('click', () => {
        selectPlaylist(playlist);
    });
    
    return playlistDiv;
}

function selectPlaylist(playlist) {
    currentPlaylist = playlist;
    console.log(`🎵 Selected: ${playlist.name}`);
    showPlaylistTracks(playlist);
}

async function showPlaylistTracks(playlist) {
    console.log('showPlaylistTracks called', playlist);
    // Asigură-te că rămâi pe library-view
    const panels = document.querySelectorAll('.content-panel');
    panels.forEach(panel => panel.classList.remove('active'));
    const libraryView = document.getElementById('library-view');
    if (libraryView) libraryView.classList.add('active');

    // Ascunde gridul cu playlisturi
    const playlistsGrid = document.getElementById('playlists-grid');
    if (playlistsGrid) playlistsGrid.style.display = 'none';

    // Containerul pentru melodii
    const tracksContainerId = 'playlist-tracks-container';
    // Șterge vechiul container dacă există
    let oldTracksContainer = document.getElementById(tracksContainerId);
    if (oldTracksContainer) oldTracksContainer.remove();

    // Creează container nou
    let tracksContainer = document.createElement('div');
    tracksContainer.id = tracksContainerId;
    tracksContainer.style.marginTop = '32px';
    tracksContainer.style.marginBottom = '32px';
    // Inserează în library-view
    libraryView.appendChild(tracksContainer);

    // Adaugă buton de revenire
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Înapoi la playlisturi';
    backBtn.className = 'control-btn';
    backBtn.style.marginBottom = '24px';
    backBtn.onclick = function() {
        tracksContainer.remove();
        if (playlistsGrid) playlistsGrid.style.display = '';
    };
    tracksContainer.appendChild(backBtn);

    tracksContainer.innerHTML += `<div class="empty-state"><span class="empty-text">Loading tracks...</span></div>`;
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log('Spotify tracks response:', response);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        console.log('Spotify tracks data:', data);
        if (!data.items || data.items.length === 0) {
            tracksContainer.innerHTML += `<div class="empty-state"><span class="empty-text">No tracks found in this playlist.</span></div>`;
            return;
        }
        // Șterge loading
        tracksContainer.innerHTML = '';
        tracksContainer.appendChild(backBtn);
        const title = document.createElement('h2');
        title.style.marginBottom = '16px';
        title.textContent = `${playlist.name} - Tracks`;
        tracksContainer.appendChild(title);

        // Stil container listă
        const listDiv = document.createElement('div');
        listDiv.style.display = 'flex';
        listDiv.style.flexDirection = 'column';
        listDiv.style.gap = '12px';
        tracksContainer.appendChild(listDiv);

        data.items.forEach((item, idx) => {
            const track = item.track;
            // Format durată mm:ss
            const ms = track.duration_ms;
            const min = Math.floor(ms / 60000);
            const sec = ((ms % 60000) / 1000).toFixed(0).padStart(2, '0');
            const duration = `${min}:${sec}`;
            // Card melodie
            const trackDiv = document.createElement('div');
            trackDiv.className = 'playlist-track pretty-track';
            trackDiv.style.display = 'flex';
            trackDiv.style.alignItems = 'center';
            trackDiv.style.background = 'var(--concrete-light)';
            trackDiv.style.borderRadius = '12px';
            trackDiv.style.padding = '10px 18px';
            trackDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            trackDiv.style.transition = 'background 0.2s, box-shadow 0.2s';
            trackDiv.style.position = 'relative';
            trackDiv.style.cursor = 'pointer';
            trackDiv.onmouseenter = () => {
                playIcon.style.opacity = '1';
                trackDiv.style.background = 'var(--warm-brown)';
            };
            trackDiv.onmouseleave = () => {
                playIcon.style.opacity = '0';
                trackDiv.style.background = 'var(--concrete-light)';
            };

            // Număr ordine
            const nr = document.createElement('span');
            nr.textContent = idx + 1;
            nr.style.fontFamily = 'var(--font-mono)';
            nr.style.fontWeight = '700';
            nr.style.fontSize = '18px';
            nr.style.width = '32px';
            nr.style.color = 'var(--amber-warm)';
            nr.style.textAlign = 'right';
            trackDiv.appendChild(nr);

            // Copertă
            const img = document.createElement('img');
            img.src = track.album.images && track.album.images.length > 0 ? track.album.images[0].url : 'src/logo.png';
            img.alt = track.name;
            img.style.width = '48px';
            img.style.height = '48px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            img.style.margin = '0 18px';
            img.style.border = '1px solid var(--warm-brown)';
            trackDiv.appendChild(img);

            // Info melodie
            const infoDiv = document.createElement('div');
            infoDiv.style.flex = '1';
            infoDiv.style.display = 'flex';
            infoDiv.style.flexDirection = 'column';
            infoDiv.style.justifyContent = 'center';
            // Titlu
            const title = document.createElement('div');
            title.textContent = track.name;
            title.style.fontFamily = 'var(--font-mono)';
            title.style.fontWeight = '700';
            title.style.fontSize = '18px';
            title.style.color = 'var(--text-primary)';
            infoDiv.appendChild(title);
            // Artist
            const artist = document.createElement('div');
            artist.textContent = track.artists.map(a => a.name).join(', ');
            artist.style.fontFamily = 'var(--font-mono)';
            artist.style.fontSize = '13px';
            artist.style.color = 'var(--text-secondary)';
            artist.style.marginTop = '2px';
            infoDiv.appendChild(artist);
            trackDiv.appendChild(infoDiv);

            // Durată
            const dur = document.createElement('span');
            dur.textContent = duration;
            dur.style.fontFamily = 'var(--font-mono)';
            dur.style.fontSize = '15px';
            dur.style.color = 'var(--amber-warm)';
            dur.style.marginLeft = '18px';
            dur.style.minWidth = '40px';
            dur.style.textAlign = 'right';
            trackDiv.appendChild(dur);

            // Iconiță play (hover)
            const playIcon = document.createElement('span');
            playIcon.innerHTML = '<i class="fas fa-play"></i>';
            playIcon.style.position = 'absolute';
            playIcon.style.right = '18px';
            playIcon.style.top = '50%';
            playIcon.style.transform = 'translateY(-50%)';
            playIcon.style.color = 'var(--amber-warm)';
            playIcon.style.fontSize = '20px';
            playIcon.style.opacity = '0';
            playIcon.style.transition = 'opacity 0.2s';
            trackDiv.appendChild(playIcon);

            listDiv.appendChild(trackDiv);
        });
    } catch (error) {
        tracksContainer.innerHTML += `<div class="empty-state"><span class="empty-text">Failed to load tracks.</span></div>`;
        console.error('Error loading playlist tracks:', error);
    }
}

// ===== ANALYTICS FUNCTIONS =====
async function getTopArtists() {
    if (!accessToken) {
        showError('Please connect to Spotify first');
        return;
    }
    
    const timeRange = getSelectedTimeRange();
    const limit = getSelectedLimit();
    
    console.log(`📊 Analyzing top artists (${timeRange}, ${limit} results)`);
    
    try {
        const resultsContainer = document.getElementById('results');
        showLoading(resultsContainer);
        
        const response = await fetch(
            `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        displayResults(data.items, 'artist');
        
        console.log(`✅ Top artists analysis complete`);
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        showError('Analysis failed. Please try again.');
        hideLoading(document.getElementById('results'));
    }
}

async function getTopTracks() {
    if (!accessToken) {
        showError('Please connect to Spotify first');
        return;
    }
    
    const timeRange = getSelectedTimeRange();
    const limit = getSelectedLimit();
    
    console.log(`📊 Analyzing top tracks (${timeRange}, ${limit} results)`);
    
    try {
        const resultsContainer = document.getElementById('results');
        showLoading(resultsContainer);
        
        const response = await fetch(
            `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        displayResults(data.items, 'track');
        
        console.log(`✅ Top tracks analysis complete`);
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        showError('Analysis failed. Please try again.');
        hideLoading(document.getElementById('results'));
    }
}

function getSelectedTimeRange() {
    const selectedRadio = document.querySelector('input[name="time"]:checked');
    return selectedRadio ? selectedRadio.value : 'short_term';
}

function getSelectedLimit() {
    const numSlider = document.getElementById('numResponses');
    return numSlider ? parseInt(numSlider.value) : 20;
}

function displayResults(items, type) {
    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) return;
    
    // Clear loading state first
    hideLoading(resultsContainer);
    resultsContainer.innerHTML = '';
    
    if (!items || items.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <span class="empty-text">NO RESULTS FOUND</span>
                <p class="empty-desc">Try adjusting your time range or sample size</p>
            </div>
        `;
        return;
    }
    
    items.forEach((item, index) => {
        const resultElement = createResultElement(item, type, index + 1);
        resultsContainer.appendChild(resultElement);
    });
}

function createResultElement(item, type, rank) {
    const resultDiv = document.createElement('div');
    resultDiv.className = type;
    
    const imageUrl = item.images && item.images.length > 0 
        ? item.images[0].url 
        : 'src/logo.png';
    
    const title = type === 'artist' ? item.name : item.name;
    const subtitle = type === 'artist' 
        ? `${item.followers?.total?.toLocaleString()} followers`
        : item.artists.map(artist => artist.name).join(', ');
    
    resultDiv.innerHTML = `
        <img src="${imageUrl}" alt="${title}" onerror="this.src='src/logo.png'">
        <h4>#${rank} ${title}</h4>
        <p>${subtitle}</p>
    `;
    
    // Add click handler for tracks
    if (type === 'track') {
        resultDiv.addEventListener('click', () => {
            console.log(`🎵 Selected track: ${title}`);
            // You could implement track playback here
        });
    }
    
    return resultDiv;
}

// ===== UTILITY FUNCTIONS =====
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        element.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <span class="loading-text">PROCESSING...</span>
            </div>
        `;
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
    }
}

function showError(message) {
    console.error(`❌ ${message}`);
    
    // Create a temporary error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

function clearResults() {
    const resultsContainer = document.getElementById('results');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

function clearPlaylists() {
    const playlistsGrid = document.getElementById('playlists-grid');
    if (playlistsGrid) {
        playlistsGrid.innerHTML = '';
    }
}

// ===== INITIALIZATION =====
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStudio);
} else {
    initializeStudio();
}

console.log('🎛️ Audio Studio Interface Loaded');
console.log('🎵 Professional listening experience ready');console.log("showPlaylistTracks called", playlist);
