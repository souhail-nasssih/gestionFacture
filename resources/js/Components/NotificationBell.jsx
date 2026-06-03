import { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { Bell, Package, CalendarClock, AlertTriangle } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';

let notificationListeners = [];
let notificationItems = [];

const mapApiNotification = (n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    data: n.data,
    read_at: n.read_at,
    at: n.created_at,
    produit: n.data?.produit_id
        ? { id: n.data.produit_id, nom: n.data.produit_nom }
        : null,
});

export const addNotification = (item) => {
    const entry = {
        id: item.id ?? `tmp-${Date.now()}`,
        type: item.type ?? 'realtime',
        title: item.title ?? 'Notification',
        message: item.message ?? '',
        data: item.data ?? (item.produit ? { produit_id: item.produit.id } : null),
        at: new Date().toISOString(),
        produit: item.produit,
    };

    const exists = notificationItems.some(
        (n) => n.message === entry.message && n.type === entry.type
    );
    if (exists) return;

    notificationItems = [entry, ...notificationItems].slice(0, 30);
    notificationListeners.forEach((fn) => fn(notificationItems));
};

export const clearNotifications = async () => {
    try {
        await axios.post(route('notifications.mark-all-read'));
        notificationItems = notificationItems.map((n) => ({
            ...n,
            read_at: new Date().toISOString(),
        }));
        notificationListeners.forEach((fn) => fn(notificationItems));
    } catch {
        notificationItems = [];
        notificationListeners.forEach((fn) => fn(notificationItems));
    }
};

export const removeNotification = (id) => {
    notificationItems = notificationItems.filter((n) => n.id !== id);
    notificationListeners.forEach((fn) => fn(notificationItems));
};

function useNotifications() {
    const [items, setItems] = useState(notificationItems);

    useEffect(() => {
        const listener = (next) => setItems([...next]);
        notificationListeners.push(listener);
        setItems([...notificationItems]);
        return () => {
            notificationListeners = notificationListeners.filter((l) => l !== listener);
        };
    }, []);

    return items;
}

const iconForType = (type) => {
    if (type?.includes('due_date')) return CalendarClock;
    if (type === 'out_of_stock') return AlertTriangle;
    return Package;
};

export default function NotificationBell() {
    const items = useNotifications();
    const unreadCount = items.filter((n) => !n.read_at).length;

    const fetchNotifications = useCallback(async () => {
        try {
            const { data } = await axios.get(route('notifications.index'));
            notificationItems = (data.notifications ?? []).map(mapApiNotification);
            notificationListeners.forEach((fn) => fn(notificationItems));
        } catch (e) {
            console.warn('Impossible de charger les notifications', e);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 20000);
        const onRefresh = () => fetchNotifications();
        window.addEventListener('notifications:refresh', onRefresh);
        return () => {
            clearInterval(interval);
            window.removeEventListener('notifications:refresh', onRefresh);
        };
    }, [fetchNotifications]);

    useEffect(() => {
        const checkDue = async () => {
            try {
                const { data } = await axios.post(route('notifications.check-due-dates'));
                if (data.notifications?.length) {
                    notificationItems = data.notifications.map(mapApiNotification);
                    notificationListeners.forEach((fn) => fn(notificationItems));
                } else {
                    await fetchNotifications();
                }
            } catch {
                // silencieux
            }
        };
        checkDue();
    }, [fetchNotifications]);

    const markOneRead = async (id) => {
        if (typeof id === 'string' && id.startsWith('tmp-')) return;
        try {
            await axios.post(route('notifications.mark-read', id));
            notificationItems = notificationItems.map((n) =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            );
            notificationListeners.forEach((fn) => fn(notificationItems));
        } catch {
            // ignore
        }
    };

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    className="relative p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content
                align="right"
                width="80"
                contentClasses="py-1 bg-white dark:bg-gray-700 min-w-[300px] max-w-sm"
            >
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Notifications
                    </p>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={clearNotifications}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Tout marquer lu
                        </button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p>Aucune notification</p>
                        </div>
                    ) : (
                        <ul className="py-1">
                            {items.map((item) => {
                                const Icon = iconForType(item.type);
                                const isUnread = !item.read_at;
                                return (
                                    <li
                                        key={item.id}
                                        className={`flex gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600/50 border-b border-gray-100 dark:border-gray-600 last:border-0 ${
                                            isUnread ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                                        }`}
                                        onClick={() => markOneRead(item.id)}
                                    >
                                        <Icon
                                            className={`h-4 w-4 shrink-0 mt-0.5 ${
                                                item.type === 'out_of_stock'
                                                    ? 'text-red-500'
                                                    : 'text-amber-500'
                                            }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            {item.title && (
                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                    {item.title}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {item.message}
                                            </p>
                                            {item.data?.action_url && (
                                                <Link
                                                    href={item.data.action_url}
                                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Voir le détail
                                                </Link>
                                            )}
                                            {item.produit?.id && !item.data?.action_url && (
                                                <Link
                                                    href={route(
                                                        'produits.historique',
                                                        item.produit.id
                                                    )}
                                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Voir le produit
                                                </Link>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-600 flex gap-3">
                    <Link
                        href={route('produits.index')}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Produits
                    </Link>
                    <Link
                        href={route('echeancier.index')}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Échéancier
                    </Link>
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}
