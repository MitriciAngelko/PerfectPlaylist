import { redirectToAuthCodeFlow, getAccessToken } from "./authCodeWithPkce";

const clientId = "f9fa57a16b964585981ff4bffd1fb46f";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    getAccessToken(clientId, code).then(accessToken => {
        fetchProfile(accessToken).then(profile => {
            populateUI(profile);
            fetchTopArtists(accessToken, 'medium_term').then(topArtists => {
                displayTopArtists(topArtists);
            });
        });
    });
}

async function fetchProfile(accessToken: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!result.ok) {
        console.error('Failed to fetch profile:', result.status, result.statusText);
        return null;
    }

    return await result.json();
}

async function fetchTopArtists(accessToken: string, timeRange: string): Promise<string[]> {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=10`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            console.error('Failed to fetch top artists:', response.status, response.statusText);
            return [];
        }

        const data = await response.json();
        return data.items.map((item: any) => item.name);
    } catch (error) {
        console.error('Error fetching top artists:', error);
        return [];
    }
}

function populateUI(profile: any) {
    if (!profile) {
        console.error('Profile is null');
        return;
    }
    document.getElementById("displayName")!.innerText = profile.display_name;
    document.getElementById("avatar")!.setAttribute("src", profile.images && profile.images[0] ? profile.images[0].url : '');
    document.getElementById("id")!.innerText = profile.id;
}

function displayTopArtists(topArtists: string[]) {
    const topArtistsElement = document.getElementById('topArtists');
    if (topArtistsElement) {
        topArtists.forEach(artist => {
            const listItem = document.createElement('li');
            listItem.textContent = artist;
            topArtistsElement.appendChild(listItem);
        });
    } else {
        console.error('Element with id "topArtists" not found');
    }
}
