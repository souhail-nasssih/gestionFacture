import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Bell, Package } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';

// Store partagé pour les notifications (alimenté par NotificationCenter)
let notificationListeners = [];
let notificationItems = [];
const MAX_ITEMS = 20;

export const addNotification = (item) => {
    const entry = {
        id: Date.now() + Math.random(),
        ...item,
        at: new Date().toISOString(),
    };
    notificationItems = [entry, ...notificationItems].slice(0, MAX_ITEMS);
    notificationListeners.forEach((fn) => fn(notificationItems));
};

export const clearNotifications = () => {
    notificationItems = [];
    notificationListeners.forEach((fn) => fn(notificationItems));
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

export default function NotificationBell() {
    const items = useNotifications();
    const count = items.length;

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    className="relative p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                            {count > 9 ? '9+' : count}
                        </span>
                    )}
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content
                align="right"
                width="80"
                contentClasses="py-1 bg-white dark:bg-gray-700 min-w-[280px] max-w-sm"
            >
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Notifications
                    </p>
                    {count > 0 && (
                        <button
                            type="button"
                            onClick={clearNotifications}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Tout effacer
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
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600/50 border-b border-gray-100 dark:border-gray-600 last:border-0"
                                >
                                    <Package className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {item.message}
                                        </p>
                                        {item.produit?.id && (
                                            <Link
                                                href={route('produits.historique', item.produit.id)}
                                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                Voir le produit
                                            </Link>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {items.length > 0 && (
                    <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-600">
                        <Link
                            href={route('produits.index')}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Voir tous les produits
                        </Link>
                    </div>
                )}
            </Dropdown.Content>
        </Dropdown>
    );
}
