const IS_LOCAL = ['localhost', '127.0.0.1']
    .includes(window.location.hostname);

const BACKEND_URL = IS_LOCAL
    ? 'http://127.0.0.1:8000'
    : 'https://val-app.onrender.com';

const SHOP_API = `${BACKEND_URL}/api/shop/`;
const USERS_API = `${BACKEND_URL}/api/users/`;
const SETTINGS_API = `${BACKEND_URL}/api/settings/`;
// Shared session helpers. Only authenticated calls to our backend are retried.
let renewalPromise = null;
function clearSession() {
    ['access_token', 'refresh_token', 'user'].forEach(key => localStorage.removeItem(key));
}
function renewSession() {
    if (renewalPromise) return renewalPromise;
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return Promise.resolve(false);
    renewalPromise = (async () => {
        const res = await fetch(USERS_API + 'token/refresh/', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refresh})
        });
        if (localStorage.getItem('refresh_token') !== refresh) return false;
        if (res.status === 401 || res.status === 400) { clearSession(); return false; }
        if (!res.ok) throw new Error('Session renewal unavailable; please retry.');
        const data = await res.json();
        if (localStorage.getItem('refresh_token') !== refresh) return false;
        localStorage.setItem('access_token', data.access);
        return true;
    })().finally(() => { renewalPromise = null; });
    return renewalPromise;
}
async function authFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    const previous = headers.get('Authorization');
    if (!previous || new URL(url, location.href).origin !== new URL(BACKEND_URL).origin) {
        return fetch(url, options);
    }
    const current = localStorage.getItem('access_token');
    if (current) headers.set('Authorization', 'Bearer ' + current);
    const first = await fetch(url, {...options, headers});
    if (first.status !== 401) return first;
    if (localStorage.getItem('access_token') === current && !(await renewSession())) {
        clearSession();
        location.href = 'login.html';
        return first;
    }
    const replacement = localStorage.getItem('access_token');
    if (!replacement) return first;
    headers.set('Authorization', 'Bearer ' + replacement);
    const retry = await fetch(url, {...options, headers});
    if (retry.status === 401) { clearSession(); location.href = 'login.html'; }
    return retry;
}
async function logoutSession() {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
        try {
            const res = await fetch(USERS_API + 'logout/', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({refresh})
            });
            if (!res.ok) throw new Error('Logout failed');
        } catch {
            alert('Could not revoke the session. Please try again when connected.');
            return;
        }
    }
    clearSession();
    location.href = 'login.html';
}
