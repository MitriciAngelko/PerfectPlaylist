import { getAccessToken, checkTokenValidity } from './utils/auth.js';
import SpotifyApiService from './services/SpotifyApiService.js';
import PlayerController from './controllers/PlayerController.js';

function setupMobileNavigation() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const playlistToggle = document.getElementById('playlist-toggle');
    const sidebar = document.querySelector('.sidebar');
    const rightSidebar = document.querySelector('.right.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Adăugăm clase pentru mobile
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile');
    }

    // Toggle pentru sidebar stânga
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) {
            rightSidebar.classList.remove('active');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Toggle pentru playlist
    playlistToggle?.addEventListener('click', () => {
        rightSidebar.classList.toggle('active');
        if (rightSidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Închide meniurile la click în afara lor
    mainContent?.addEventListener('click', () => {
        sidebar.classList.remove('active');
        rightSidebar.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    // Actualizare la redimensionare
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
            document.body.style.overflow = 'hidden';
        }
    });
}

async function initializeApp() {
    const token = getAccessToken();
    if (!token) {
        window.location.href = '../index.html#error=no_token';
        return;
    }

    const apiService = new SpotifyApiService(token);
    const playerController = new PlayerController(apiService);
    
    // Inițializare aplicație...
    setupMobileNavigation();
}

document.addEventListener('DOMContentLoaded', initializeApp); 