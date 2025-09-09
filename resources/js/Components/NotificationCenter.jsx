import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';

export default function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    function loadCount() {
        fetch(route('notifications.unreadCount'))
            .then(r=>r.json())
            .then(d=> setCount(d.count || 0));
    }

    function loadItems() {
        setLoading(true);
        fetch(route('notifications.index') + '?only_unread=0')
            .then(r=>r.json())
            .then(d=> setItems(d.data || []))
            .finally(()=> setLoading(false));
    }

    useEffect(()=> {
        loadCount();
        const id = setInterval(loadCount, 30000);
        return ()=> clearInterval(id);
    }, []);

    useEffect(()=>{
        if (open) loadItems();
    }, [open]);

    function markAll() {
        fetch(route('notifications.readAll'), { method: 'POST' })
            .then(()=> { loadCount(); loadItems(); });
    }

    function markOne(id) {
        fetch(route('notifications.read', id), { method: 'POST' })
            .then(()=> { loadCount(); loadItems(); });
    }

    return (
        <div className="relative">
            <button onClick={()=> setOpen(!open)} className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="h-5 w-5" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {count}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 z-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-semibold">Notifications</div>
                        <button onClick={markAll} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border">
                            <Check className="h-4 w-4"/> Tout marquer comme lu
                        </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-3 text-sm">Chargement...</div>
                        ) : items.length === 0 ? (
                            <div className="p-3 text-sm text-gray-500">Aucune notification</div>
                        ) : (
                            items.map(n => (
                                <div key={n.id} className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 text-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="font-medium">{n.title}</div>
                                            {n.message && <div className="text-gray-600 dark:text-gray-300">{n.message}</div>}
                                        </div>
                                        {!n.read_at && (
                                            <button onClick={()=>markOne(n.id)} className="text-xs px-2 py-1 rounded border">Lu</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


