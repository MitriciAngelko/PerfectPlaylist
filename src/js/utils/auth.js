export const getAccessToken = () => localStorage.getItem('spotify_access_token');

export const setAccessToken = (token) => localStorage.setItem('spotify_access_token', token);

export const clearAccessToken = () => localStorage.removeItem('spotify_access_token');

export const checkTokenValidity = async (token) => {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.ok;
    } catch {
        return false;
    }
}; 