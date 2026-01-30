import { useEcho, useConnectionStatus } from '@laravel/echo-react';
import { showToast } from '@/Components/Toast';
import { addNotification } from '@/Components/NotificationBell';

/**
 * Écoute le canal privé "low-stock" et affiche une notification toast
 * + enregistre dans la cloche quand un produit passe en dessous du seuil.
 */
export default function NotificationCenter() {
    useEcho(
        'low-stock',
        '.low-stock.alert',
        (payload) => {
            const { message, produit } = payload;
            const text =
                message ??
                `Stock bas : ${produit?.nom} (${produit?.stock} restants)`;
            showToast(text, 'info');
            addNotification({ message: text, produit });
        },
        []
    );

    return null;
}

/**
 * Indicateur optionnel du statut WebSocket (pour debug ou UX).
 * Affiche "Connecté" / "Connexion..." etc.
 */
export function EchoConnectionStatus() {
    const status = useConnectionStatus();
    const labels = {
        connected: 'Connecté',
        connecting: 'Connexion…',
        reconnecting: 'Reconnexion…',
        disconnected: 'Déconnecté',
        failed: 'Échec',
    };
    const label = labels[status] ?? status;
    const color =
        status === 'connected'
            ? 'text-green-600 dark:text-green-400'
            : status === 'failed'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400';

    return (
        <span className={`text-xs ${color}`} title={`WebSocket: ${status}`}>
            {label}
        </span>
    );
}
