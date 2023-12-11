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

// function createPlaylist() {
//   if (access_token) {
//     $.ajax({
//       url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
//       method: 'POST',
//       data: JSON.stringify({
//         name: 'Top Tracks ' + time_range_display,
//         public: false,
//       }),
//       headers: {
//         'Authorization': 'Bearer ' + access_token,
//         'Content-Type': 'application/json',
//       },
//       success: function(response) {
//         addTracks(response.id);
//       },
//       error: function(jqXHR, textStatus, errorThrown) {
//         ifError(jqXHR.status);
//       },
//     });
//   }
// } 

// function addTracks(playlist_id) {
//   if (access_token) {
//     $.ajax({
//       url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists/' + playlist_id + '/tracks',
//       method: 'POST',
//       data: JSON.stringify({
//         uris: playlist_uris,
//       }),
//       headers: {
//         'Authorization': 'Bearer ' + access_token,
//         'Content-Type': 'application/json',
//       },
//       success: function(response) {
//         $('#results').html('<p>Playlist created successfully.</p>');
//       },
//       error: function(jqXHR, textStatus, errorThrown) {
//         ifError(jqXHR.status);
//       },
//     });
//   }
// }

// Function to create a playlist
// async function createPlaylist() {
//   try {
//       // Create the playlist
//       const response = await fetch('https://api.spotify.com/v1/users/' + user_id + '/playlists', {
//           method: 'POST',
//           headers: {
//               'Accept': 'application/json',
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//               name: name,
//               description: "Playlist generated using singlespotify by Kabir Virji",
//               public: true
//           }),
//       });

//       if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       return await response.json();
//   } catch (error) {
//       console.error('Error creating playlist:', error.message);
//       throw error;
//   }
// };
// window.createPlaylist = createPlaylist;



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