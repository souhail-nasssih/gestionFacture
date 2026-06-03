import axios from 'axios';
import { configureEcho } from '@laravel/echo-react';

window.axios = axios;

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';
const useTls = reverbScheme === 'https';
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT ?? 8081);

if (reverbKey) {
    configureEcho({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
        wsPort: useTls ? 443 : reverbPort,
        wssPort: useTls ? reverbPort : 443,
        forceTLS: useTls,
        // En local (http) : ws uniquement — évite les erreurs wss://localhost
        enabledTransports: useTls ? ['wss'] : ['ws'],
        authEndpoint: `${window.location.origin}/broadcasting/auth`,
        auth: {
            headers: {
                'X-XSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
        },
    });
}

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

export const isEchoEnabled = () => Boolean(reverbKey);
