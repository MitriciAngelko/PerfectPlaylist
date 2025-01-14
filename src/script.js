import SpotifyController from './controller.js';

const spotifyController = new SpotifyController();

console.log('Script.js loaded');

function authorize() {
    console.log('Authorize function called');
    spotifyController.authorize();
}

function getHashValue(key) {
  if (typeof key !== 'string') {
    key = '';
  } else {
    key = key.toLowerCase();
  }
  const keyAndHash = location.hash.match(new RegExp(key + '=([^&]*)'));
  const value = keyAndHash ? keyAndHash[1] : '';
  return value;
}

function updateRange() {
  spotifyController.setTimeRange($('input[name=time]:checked', '#timeForm').val());
  refresh();
}

function refresh() {
  if (spotifyController.songsdisplayed) {
    getTopTracks();
  } else if (spotifyController.artistsdisplayed) {
    getTopArtists();
  }
}

function checkWidth() {
  if (window.innerWidth < 1200) {
    $('html, body').animate({
      scrollTop: $("#results-container").offset().top
    }, 500);
  }
}

async function getUserId() {
  try {
    const userProfile = await spotifyController.getUserProfile();
    $('#user-name').text(userProfile.displayName);
    if (userProfile.profileImage) {
      $('#user-profile-pic').attr('src', userProfile.profileImage);
    }
  } catch (error) {
    ifError(error.status);
  }
}

async function getTopArtists() {
  $('#artist-button').addClass("loading");
  try {
    const artists = await spotifyController.getTopArtists();
        $('#artist-button').removeClass("loading");
        $('#results').empty();
        $('#results-header').html('<h2>Top Artists</h2>');
    
        let resultsHtml = '';
    artists.forEach((item, i) => {
          let name = item.name;
          let url = item.external_urls.spotify;
          let image = item.images[1].url;
          resultsHtml += '<div class="column wide artist item"><a href="' + url + '" target="_blank"><img src="' + image + '"></a><h4 class="title">' + (i + 1) + '. ' + name + '</h4></div>';
        });
    
        $('#results').html(resultsHtml);
        checkWidth();
  } catch (error) {
    ifError(error.status);
  }
}

async function getTopTracks() {
  $('#track-button').addClass("loading");
  try {
    const tracks = await spotifyController.getTopTracks();
        $('#track-button').removeClass("loading");
    spotifyController.playlist_uris = tracks.map(item => item.uri);
        $('#results').empty();
        $('#results-header').html('<h2>Top Tracks</h2>');
        let resultsHtml = '';

    if (tracks.length === 0) {
          resultsHtml = '<p>No top tracks found.</p>';
        } else {
      tracks.forEach((item, i) => {
            let trackName = item.name;
            let artistName = item.artists[0].name;
            let url = item.external_urls ? item.external_urls.spotify : '';
            let image = item.album.images[1] ? item.album.images[1].url : '';
            resultsHtml += '<div class="column wide track item"><a href="' + url + '" target="_blank"><img src="' + image + '"></a><h4>' + (i + 1) + '. ' + trackName + ' <br>' + artistName + ' </h4></div>';
          });
        }

        $('#results').html(resultsHtml);

    spotifyController.songsdisplayed = true;
    spotifyController.artistsdisplayed = false;
        checkWidth();
  } catch (error) {
    if (error.status === 401) {
      ifError(error.status);
        } else {
          $('#track-button').removeClass("loading");
          $('#results').html('<p>Error retrieving top tracks. Please try again later.</p>');
        }
  }
}

function ifError(error) {
  retryLogin();
  disableControls();
  let errorMessage;
  switch (error) {
    case 401:
      errorMessage = 'Unauthorized. Please log in to Spotify.';
      break;
    case 429:
      errorMessage = 'Too many requests. Please try again later.';
      break;
    default:
      errorMessage = 'Unable to authorize through Spotify Web API. Please try logging in again.';
  }
  alert(errorMessage);
}

function retryLogin() {
  $('#instructions').css('display', 'block');
  $('#login').css('display', 'block');
}

function enableControls() {
  $('#instructions').css('display', 'none');
  $('#login').css('display', 'none');
  $('#button-segment').removeClass("disabled");
  $('#timeForm').removeClass("disabled");
  $('#numForm').removeClass("disabled");
  setupPlayerControls();
  currentlyPlaying();
}

function disableControls() {
  $('#button-segment').addClass("disabled");
  $('#track-button').addClass("disabled");
  $('#artist-button').addClass("disabled");
  $('#timeForm').addClass("disabled");
  $('#numForm').addClass("disabled");
}

async function createPlaylist() {
  console.log(spotifyController.access_token);
  if(spotifyController.access_token){
    try {
      let timeRange;
      let timeRangeText;
      if (document.querySelector('#last-4-weeks').checked) {
        timeRange = 'short_term';
        timeRangeText = 'Last 4 Weeks';
      } else if (document.querySelector('#last-6-months').checked) {
        timeRange = 'medium_term';
        timeRangeText = 'Last 6 Months';
      } else if (document.querySelector('#all-time').checked) {
        timeRange = 'long_term';
        timeRangeText = 'All Time';
      }

      const playlistName = `Perfect Playlist - ${timeRangeText}`;

      const response = await fetch(`https://api.spotify.com/v1/users/${spotifyController.user_id}/playlists`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${spotifyController.access_token}`,
        },
        body: JSON.stringify({
          name: playlistName,
          description: "This playlist has been created using PerfectPlaylist.",
          public: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const playlistId = data.id;
      console.log(playlistId);

      const artistsResponse = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${spotifyController.access_token}`,
        },
      });

      if (!artistsResponse.ok) {
        throw new Error(`HTTP error! Status: ${artistsResponse.status}`);
      }

      const artistsData = await artistsResponse.json();
      const artistIds = artistsData.items.map(item => item.id);

      const trackUris = [];
      for (const artistId of artistIds) {
        const tracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`, {
          headers: {
            'Authorization': `Bearer ${spotifyController.access_token}`,
          },
        });

        if (!tracksResponse.ok) {
          throw new Error(`HTTP error! Status: ${tracksResponse.status}`);
        }

        const tracksData = await tracksResponse.json();
        const topTracks = tracksData.tracks
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 2)
          .map(track => track.uri);

        trackUris.push(...topTracks);
      }

      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${spotifyController.access_token}`,
        },
        body: JSON.stringify({
          uris: trackUris
        })
      });

      if (!addTracksResponse.ok) {
        throw new Error(`HTTP error! Status: ${addTracksResponse.status}`);
      }

      console.log('Tracks added to playlist');
    } catch (error) {
      console.error('Error creating playlist:', error.message);
      throw error;
    }
  }
}

function initialize() {
  $('#timeForm input').on('change', function() {
        spotifyController.setTimeRange($('input[name=time]:checked', '#timeForm').val());
    refresh();
  });

  const slider = document.getElementById("numResponses");
    if (slider) {  // Verificăm dacă elementul există
  slider.oninput = function() {
            spotifyController.setLimit(this.value);
            $('#number').html("Number of results: " + this.value);
  }

  $('#numResponses').on('change', refresh);
}

    setupPlaylistClickHandlers();
    setupPlayerControls();
    setInterval(currentlyPlaying, 3000);
}

function logout() {
    localStorage.removeItem('spotify_access_token');
    spotifyController.clearAccessToken();
    
    // Ascunde elementele care necesită autentificare
    $('#user-profile-pic').attr('src', '');
    $('#user-name-text').text('');
    $('#logout-button').hide();
    $('#navigation').hide();
    $('#library-view').addClass('hidden');
    $('#top-items-view').addClass('hidden');
    
    // Arată butonul de login
    $('#login-button').show();
}

$(document).ready(async function() {
    $('#login-button').on('click', function() {
        authorize();
    });

    initialize();
    const hashToken = getHashValue('access_token');
    if (hashToken) {
        localStorage.setItem('spotify_access_token', hashToken);
        spotifyController.setAccessToken(hashToken);
        try {
            await getUserId();
            $('#login-button').hide();
            $('#logout-button').show();
            $('#navigation').show();
            window.location.hash = '';
            await showLibrary();
        } catch (error) {
            console.error('Error after login:', error);
        }
    } else {
        const storedToken = localStorage.getItem('spotify_access_token');
        if (storedToken) {
            spotifyController.setAccessToken(storedToken);
            try {
                const isValid = await spotifyController.checkTokenValidity();
                if (isValid) {
                    await getUserId();
                    $('#login-button').hide();
                    $('#logout-button').show();
                    $('#navigation').show();
                    await showLibrary();
                }
            } catch (error) {
                console.error('Error checking token:', error);
                localStorage.removeItem('spotify_access_token');
                $('#login-button').show();
                $('#logout-button').hide();
                $('#navigation').hide();
            }
  } else {
            $('#login-button').show();
            $('#logout-button').hide();
            $('#navigation').hide();
        }
    }
});

function updatePlayPauseButton(isPlaying) {
    const icon = $('#play-pause-button i');
    if (isPlaying) {
        icon.removeClass('play').addClass('pause');
    } else {
        icon.removeClass('pause').addClass('play');
    }
}

function setupPlayerControls() {
    $('#play-pause-button').on('click', async () => {
        try {
            const isPlaying = await spotifyController.togglePlayPause();
            updatePlayPauseButton(isPlaying);
            setTimeout(async () => {
                await currentlyPlaying();
            }, 200);
        } catch (error) {
            console.error('Error toggling playback:', error);
            showError(error.message || 'Failed to toggle playback');
        }
    });

    $('#next-button').on('click', async () => {
        try {
            await spotifyController.skipToNext();
            setTimeout(async () => {
                await currentlyPlaying();
                const playbackState = await spotifyController.getCurrentPlaybackState();
                if (playbackState) {
                    updateActiveTrack(playbackState.currentTrackUri);
                }
            }, 200);
        } catch (error) {
            console.error('Error skipping to next:', error);
            showError(error.message || 'Failed to skip to next track');
        }
    });

    $('#prev-button').on('click', async () => {
        try {
            await spotifyController.skipToPrevious();
            setTimeout(async () => {
                await currentlyPlaying();
                const playbackState = await spotifyController.getCurrentPlaybackState();
                if (playbackState) {
                    updateActiveTrack(playbackState.currentTrackUri);
                }
            }, 200);
        } catch (error) {
            console.error('Error skipping to previous:', error);
            showError(error.message || 'Failed to skip to previous track');
        }
    });
}

async function currentlyPlaying() {
    try {
        const currentTrack = await spotifyController.getCurrentPlaybackState();
        if (currentTrack && currentTrack.currentTrack) {
            $('#current-track-img').attr('src', currentTrack.currentTrack.album.images[0].url);
            $('#current-track-name').text(currentTrack.currentTrack.name);
            $('#current-track-artist').text(currentTrack.currentTrack.artists.map(a => a.name).join(', '));
            $('.player-compact').show();
            updatePlayPauseButton(currentTrack.isPlaying);
        } else {
            $('.player-compact').hide();
        }
    } catch (error) {
        console.error('Error updating player:', error);
        if (error.status === 401) {
            ifError(error.status);
        }
        $('.player-compact').hide();
    }
}

async function showLibrary() {
    $('#top-items-view').addClass('hidden');
    $('#library-view').removeClass('hidden');
    
    try {
        const playlists = await spotifyController.getUserPlaylists();
        const playlistsHtml = playlists.map(playlist => `
            <div class="playlist-item" data-playlist-id="${playlist.id}">
                <img src="${playlist.images[0]?.url || 'path/to/default-playlist-image.png'}" alt="${playlist.name}">
                <div class="playlist-item-info">
                    <h3>${playlist.name}</h3>
                    <p>${playlist.tracks.total} tracks</p>
                </div>
            </div>
        `).join('');
        
        $('#playlists-grid').html(playlistsHtml);
        
        $('.playlist-item').on('click', async function() {
            const playlistId = $(this).data('playlist-id');
            try {
                const tracks = await spotifyController.getPlaylistTracks(playlistId);
                updatePlaylistView(tracks);
            } catch (error) {
                console.error('Error loading playlist tracks:', error);
            }
        });
    } catch (error) {
        console.error('Error loading playlists:', error);
    }
}

function showTopItems() {
    $('#library-view').addClass('hidden');
    $('#top-items-view').removeClass('hidden');
}

function updatePlaylistView(tracks, playlistUri) {
    const $playlistTracks = $('#playlist-tracks');
    $playlistTracks.empty();

    tracks.forEach(track => {
        const trackHtml = `
            <div class="playlist-track" 
                 data-uri="${track.uri}" 
                 data-context="${playlistUri}">
                <img src="${track.album.images[track.album.images.length-1].url}" alt="${track.name}">
                <div class="track-info">
                    <div class="title">${track.name}</div>
                    <div class="artist">${track.artists.map(a => a.name).join(', ')}</div>
                </div>
                <button class="add-to-queue-btn" title="Add to queue">
                    <i class="plus icon"></i>
                </button>
            </div>`;
        $playlistTracks.append(trackHtml);
    });

    // Adăugăm event listeners
    $('.playlist-track').on('click', function(e) {
        // Verificăm dacă click-ul a fost pe butonul de add to queue
        if (!$(e.target).closest('.add-to-queue-btn').length) {
            const trackUri = $(this).data('uri');
            const contextUri = $(this).data('context');
            playTrack(trackUri, contextUri);
        }
    });

    $('.add-to-queue-btn').on('click', async function(e) {
        e.stopPropagation();
        const trackUri = $(this).closest('.playlist-track').data('uri');
        try {
            await spotifyController.addToQueue(trackUri);
            showSuccess('Added to queue');
        } catch (error) {
            console.error('Error adding to queue:', error);
            showError('Failed to add to queue');
        }
    });
}

async function playTrack(trackUri, contextUri) {
    try {
        await spotifyController.playTrack(trackUri, contextUri);
        updateActiveTrack(trackUri);
    } catch (error) {
        console.error('Error playing track:', error);
        showError(error.message || 'Failed to play track. Please make sure Spotify is open and active.');
    }
}

async function loadPlaylistTracks(playlistId) {
    try {
        const playlist = await spotifyController.getPlaylist(playlistId);
        const tracks = await spotifyController.getPlaylistTracks(playlistId);
        const playlistUri = `spotify:playlist:${playlistId}`;
        updatePlaylistView(tracks, playlistUri);
        
        const playbackState = await spotifyController.getCurrentPlaybackState();
        if (playbackState) {
            updateActiveTrack(playbackState.currentTrackUri);
        }
    } catch (error) {
        console.error('Error loading playlist tracks:', error);
        showError(error.message || 'Failed to load playlist tracks');
    }
}

function updateActiveTrack(currentTrackUri) {
    $('.playlist-track').removeClass('active');
    if (currentTrackUri) {
        $(`.playlist-track[data-uri="${currentTrackUri}"]`).addClass('active');
    }
}

function showError(message) {
    const errorHtml = `
        <div class="ui negative message" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
            <i class="close icon"></i>
            <div class="header">Error</div>
            <p>${message}</p>
        </div>
    `;
    
    const $error = $(errorHtml);
    $('body').append($error);
    
    $error.find('.close').on('click', function() {
        $error.remove();
    });
    
    setTimeout(() => {
        $error.fadeOut(() => $error.remove());
    }, 5000);
}

// Adăugăm funcția pentru click pe playlist-uri
function setupPlaylistClickHandlers() {
    $(document).on('click', '.playlist-item', async function() {
        try {
            const playlistId = $(this).data('playlist-id');
            if (!playlistId) {
                console.error('No playlist ID found');
                return;
            }
            await loadPlaylistTracks(playlistId);
        } catch (error) {
            console.error('Error handling playlist click:', error);
            showError('Failed to load playlist');
        }
    });
}

// Adăugăm funcția pentru a deschide profilul Spotify
function openSpotifyProfile() {
    const profileUrl = $('#user-profile-pic').data('profile-url');
    if (profileUrl) {
        window.open(profileUrl, '_blank');
    }
}

// Modificăm funcția care setează informațiile utilizatorului
function updateUserProfile(userInfo) {
    if (userInfo.images && userInfo.images.length > 0) {
        $('#user-profile-pic')
            .attr('src', userInfo.images[0].url)
            .data('profile-url', userInfo.external_urls.spotify)
            .css('cursor', 'pointer')
            .on('click', openSpotifyProfile);
    }
    $('#user-name-text').text(userInfo.display_name);
}

window.authorize = authorize;
window.getTopArtists = getTopArtists;
window.getTopTracks = getTopTracks;
window.createPlaylist = createPlaylist;
window.showLibrary = showLibrary;
window.showTopItems = showTopItems;
window.logout = logout;