let access_token = null;
let user_id = null;
let songsdisplayed = false;
let artistsdisplayed = false;
let time_range = 'short_term';
let time_range_display = 'last 4 weeks';
let playlist_uris = [];
let limit = '20';

function authorize() {
  const client_id = 'f9fa57a16b964585981ff4bffd1fb46f';
  const redirect_uri = 'http://localhost:5173/callback';
  const scopes = 'user-top-read playlist-modify-public playlist-modify-private';

const d = new Date();
let date = [d.getMonth() +  1, d.getDate(), d.getFullYear()];
date = date.join('/');

  let url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(client_id);
  url += '&scope=' + encodeURIComponent(scopes);
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
  window.location = url;

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
  time_range = $('input[name=time]:checked', '#timeForm').val();
  switch (time_range) {
    case 'short_term':
      time_range_display = 'last 4 weeks';
      break;
    case 'medium_term':
      time_range_display = 'last 6 months';
      break;
    case 'long_term':
      time_range_display = 'all time';
      break;
  }
}

function refresh() {
  if (songsdisplayed) {
    getTopTracks();
  } else if (artistsdisplayed) {
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

function getUserId() {
  if (access_token) {
    $.ajax({
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response) {
        user_id = response.id;
        const userProfileImages = response.images;
        const displayName = response.display_name;
        $('#user-name').text(displayName);
        if (userProfileImages && userProfileImages.length > 0) {
          const userProfilePictureUrl = userProfileImages[0].url;
          $('#user-profile-pic').attr('src', userProfilePictureUrl);
        }

      },
      error: (jqXHR, textStatus, errorThrown) => {
        ifError(jqXHR.status);
      },
    });
  } else {
    alert('Please log in to Spotify.');
  }
}

function getTopArtists() {
  $('#artist-button').addClass("loading");
  if (access_token) {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/top/artists',
      data: {
        limit: limit,
        time_range: time_range,
      },
      headers: {
        'Authorization': 'Bearer ' + access_token,
      },
      success: function(response) {
        $('#artist-button').removeClass("loading");
        $('#results').empty();
        $('#results-header').html('<h2>Top Artists</h2>');
        let resultsHtml = '';
        response.items.forEach((item, i) => {
          let name = item.name;
          let url = item.external_urls.spotify;
          let image = item.images[1].url;
          resultsHtml += '<div class="column wide artist item"><a href="' + url + '" target="_blank"><img src="' + image + '"></a><h4 class="title">' + (i + 1) + '. ' + name + '</h4></div>';
        });
        $('#results').html(resultsHtml);

        artistsdisplayed = true;
        songsdisplayed = false;
        checkWidth();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        ifError(jqXHR.status);
      },
    });
  } else {
    alert('Please log in to Spotify.');
  }
}

function getTopTracks() {
  $('#track-button').addClass("loading");
  if (access_token) {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/top/tracks',
      data: {
        limit: limit,
        time_range: time_range,
      },
      headers: {
        'Authorization': 'Bearer ' + access_token,
      },
      success: function(response) {
        $('#track-button').removeClass("loading");
        playlist_uris = [];
        $('#results').empty();
        $('#results-header').html('<h2>Top Tracks</h2>');
        let resultsHtml = '';

        if (response.items.length === 0) {
          resultsHtml = '<p>No top tracks found.</p>';
        } else {
          response.items.forEach((item, i) => {
            playlist_uris.push(item.uri);
            let trackName = item.name;
            let artistName = item.artists[0].name;
            let url = item.external_urls ? item.external_urls.spotify : '';
            let image = item.album.images[1] ? item.album.images[1].url : '';
            resultsHtml += '<div class="column wide track item"><a href="' + url + '" target="_blank"><img src="' + image + '"></a><h4>' + (i + 1) + '. ' + trackName + ' <br>' + artistName + ' </h4></div>';
          });
        }

        $('#results').html(resultsHtml);

        songsdisplayed = true;
        artistsdisplayed = false;
        checkWidth();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
          ifError(jqXHR.status);
        } else {
          $('#track-button').removeClass("loading");
          $('#results').html('<p>Error retrieving top tracks. Please try again later.</p>');
        }
      },
    });
  } else {
    alert('Please log in to Spotify.');
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

$(document).ready(function() {
  initialize();
  access_token = getHashValue('access_token');

function enableControls() {
  $('#instructions').css('display', 'none');
  $('#login').css('display', 'none');
  $('#button-segment').removeClass("disabled");
  $('#timeForm').removeClass("disabled");
  $('#numForm').removeClass("disabled");
}

function disableControls() {
  $('#button-segment').addClass("disabled");
  $('#track-button').addClass("disabled");
  $('#artist-button').addClass("disabled");
  $('#timeForm').addClass("disabled");
  $('#numForm').addClass("disabled");
}

function currentlyPlaying() {
  if(access_token){
    console.log("success");
  setInterval(async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.is_playing) {
        const songName = data.item.name;
        const artistName = data.item.artists[0].name;
        console.log(`Currently playing: ${songName} by ${artistName}`);
        $('#currently-playing').text(`Currently playing: ${songName} by ${artistName}`);
      } else {
        console.log('No song currently playing');
        $('#currently-playing').text('No song currently playing');
      }
    } catch (error) {
      console.error('Error getting currently playing song:', error.message);
      throw error;
    }
  }, 5000);
}
}

async function createPlaylist() {
  console.log(access_token);
  if(access_token){
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

      const response = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
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
          'Authorization': `Bearer ${access_token}`,
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
            'Authorization': `Bearer ${access_token}`,
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
          'Authorization': `Bearer ${access_token}`,
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

window.createPlaylist = createPlaylist;

function initialize() {
  $('#timeForm input').on('change', function() {
    updateRange();
    refresh();
  });
  const slider = document.getElementById("numResponses");
  slider.oninput = function() {
    limit = $('#numResponses').val().toString();
    $('#number').html("Number of results: " + limit);
  }

  $('#numResponses').on('change', refresh);
}

  if (access_token) {
    getUserId();
    enableControls();
  } else {
    disableControls();
  }
});