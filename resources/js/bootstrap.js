import axios from 'axios';
import { configureEcho } from '@laravel/echo-react';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Laravel Echo + Reverb pour les notifications temps réel (ex: stock bas)
configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${window.location.origin}/broadcasting/auth`,
    auth: {
        headers: {
            'X-XSRF-TOKEN': getCsrfToken(),
            'Accept': 'application/json',
        },
    },
});

function getCsrfToken() {
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.startsWith(' ')) c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length).trim();
    }
    return '';
}
