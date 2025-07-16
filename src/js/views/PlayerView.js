class PlayerView {
    constructor() {
        this.elements = {
            playPauseBtn: document.getElementById('play-btn'), // era 'play-pause-button'
            nextBtn: document.getElementById('next-btn'), // era 'next-button'
            prevBtn: document.getElementById('prev-btn'), // era 'prev-button'
            trackImg: document.getElementById('track-artwork'), // era 'current-track-img'
            trackName: document.getElementById('track-title'), // era 'current-track-name'
            trackArtist: document.getElementById('track-artist') // acesta era corect
        };
    }

    updateTrackInfo(track) {
        this.elements.trackImg.src = track.album.images[0].url;
        this.elements.trackName.textContent = track.name;
        this.elements.trackArtist.textContent = track.artists.map(a => a.name).join(', ');
    }
}

export default PlayerView; 