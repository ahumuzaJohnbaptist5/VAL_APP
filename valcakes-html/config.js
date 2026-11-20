const IS_LOCAL = ['localhost', '127.0.0.1']
    .includes(window.location.hostname);

const BACKEND_URL = IS_LOCAL
    ? 'http://127.0.0.1:8000'
    : 'https://val-app.onrender.com';

const SHOP_API = `${BACKEND_URL}/api/shop/`;
const USERS_API = `${BACKEND_URL}/api/users/`;
const SETTINGS_API = `${BACKEND_URL}/api/settings/`;