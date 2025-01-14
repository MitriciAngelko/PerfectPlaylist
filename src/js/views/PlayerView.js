class PlayerView {
    constructor() {
        this.elements = {
            playPauseBtn: document.getElementById('play-pause-button'),
            nextBtn: document.getElementById('next-button'),
            prevBtn: document.getElementById('prev-button'),
            trackImg: document.getElementById('current-track-img'),
            trackName: document.getElementById('current-track-name'),
            trackArtist: document.getElementById('current-track-artist')
        };
    }

    updateTrackInfo(track) {
        this.elements.trackImg.src = track.album.images[0].url;
        this.elements.trackName.textContent = track.name;
        this.elements.trackArtist.textContent = track.artists.map(a => a.name).join(', ');
    }
}

export default PlayerView; 