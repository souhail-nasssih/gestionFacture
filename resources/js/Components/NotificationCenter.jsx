import { useEcho } from '@laravel/echo-react';
import { showToast } from '@/Components/Toast';
import { addNotification } from '@/Components/NotificationBell';
import { isEchoEnabled } from '@/bootstrap';

/**
 * Écoute le canal privé "low-stock" et affiche une notification toast
 * + enregistre dans la cloche quand un produit passe en dessous du seuil.
 */
function NotificationCenterListener() {
    useEcho(
        'low-stock',
        '.low-stock.alert',
        (payload) => {
            const { message, produit } = payload;
            const text =
                message ??
                `Stock bas : ${produit?.nom} (${produit?.stock} restants)`;
            showToast(text, 'info');
            addNotification({
                type: 'low_stock',
                title: 'Stock bas',
                message: text,
                produit,
            });
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        },
        []
    );

    return null;
}

export default function NotificationCenter() {
    if (!isEchoEnabled()) {
        return null;
    }

    return <NotificationCenterListener />;
}
