import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { router } from '@inertiajs/react';
import { Bell, X, Check, Trash2, AlertTriangle, AlertCircle, Calendar, Clock } from 'lucide-react';
import { showToast } from '@/Components/Toast';

const NotificationCenter = forwardRef((props, ref) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
        checkDueDates,
        refreshNotifications: fetchNotifications,
        refreshUnreadCount: fetchUnreadCount
    }));

    // Trigger due date check on backend
    const checkDueDates = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            if (!csrfToken) {
                console.error('❌ CSRF token not found in meta tags');
                return;
            }

            const response = await fetch('/api/notifications/check-due-dates', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken.getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                // After checking due dates, refresh notifications
                await fetchNotifications();
                await fetchUnreadCount();
            } else {
                console.error('❌ Failed to check due dates:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ Error checking due dates:', error);
        }
    };

    // Charger les notifications
    const fetchNotifications = async () => {
        try {
            // Vérifier si le token CSRF existe
            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            if (!csrfToken) {
                console.error('❌ CSRF token not found in meta tags');
                return;
            }

            const response = await fetch('/api/notifications', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken.getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.data || []);
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to fetch notifications:', response.status, response.statusText);
                console.error('❌ Error response:', errorText);
            }
        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
        }
    };

    // Charger le nombre de notifications non lues
    const fetchUnreadCount = async () => {
        try {
            // Vérifier si le token CSRF existe
            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            if (!csrfToken) {
                console.error('❌ CSRF token not found in meta tags');
                return;
            }

            const response = await fetch('/api/notifications/unread-count', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken.getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count || 0);
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to fetch unread count:', response.status, response.statusText);
                console.error('❌ Error response:', errorText);
            }
        } catch (error) {
            console.error('❌ Error fetching unread count:', error);
        }
    };

    // Marquer une notification comme lue
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Mettre à jour l'état local
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, read_at: new Date().toISOString() }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                console.log('Notification marked as read');
            } else {
                console.error('Failed to mark notification as read:', result);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Marquer toutes les notifications comme lues
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Mettre à jour l'état local
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
                );
                setUnreadCount(0);
                console.log('All notifications marked as read');
            } else {
                console.error('Failed to mark all notifications as read:', result);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    // Supprimer une notification
    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Mettre à jour l'état local
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

                // Décrémenter le compteur seulement si la notification était non lue
                const deletedNotification = notifications.find(notif => notif.id === notificationId);
                if (deletedNotification && !deletedNotification.read_at) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }

                console.log('Notification deleted successfully');
            } else {
                console.error('Failed to delete notification:', result);
                showToast('Erreur lors de la suppression de la notification', 'error');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            showToast('Erreur lors de la suppression de la notification', 'error');
        }
    };

    // Charger les données au montage du composant
    useEffect(() => {
        const initializeNotifications = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchNotifications(),
                    fetchUnreadCount()
                ]);
                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeNotifications();

        // Actualiser toutes les 30 secondes seulement après l'initialisation
        const interval = setInterval(() => {
            if (isInitialized) {
                fetchUnreadCount();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [isInitialized]);

    // Recharger les notifications
    const refreshNotifications = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchNotifications(),
                fetchUnreadCount()
            ]);
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Ouvrir/fermer le panneau
    const togglePanel = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    // Formater la date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'À l\'instant';
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
        if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
        return date.toLocaleDateString('fr-FR');
    };

    // Obtenir l'icône selon le type de notification
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'low_stock':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'out_of_stock':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'due_date.client':
            case 'due_date.fournisseur':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'due_date.upcoming.client':
            case 'due_date.upcoming.fournisseur':
                return <Calendar className="h-5 w-5 text-blue-500" />;
            default:
                return <Bell className="h-5 w-5 text-blue-500" />;
        }
    };

    // Obtenir la couleur selon le type
    const getNotificationColor = (type) => {
        switch (type) {
            case 'low_stock':
                return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
            case 'out_of_stock':
                return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
            case 'due_date.client':
            case 'due_date.fournisseur':
                return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
            case 'due_date.upcoming.client':
            case 'due_date.upcoming.fournisseur':
                return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
            default:
                return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
        }
    };

    return (
        <div className="relative">
            {/* Bouton de notification */}
            <button
                onClick={togglePanel}
                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
                disabled={loading}
            >
                <Bell className="h-6 w-6" />

                {/* Badge de notification */}
                {unreadCount > 0 && !loading && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                {/* Indicateur de chargement */}
                {loading && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    </span>
                )}
            </button>

            {/* Panneau des notifications */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    {/* En-tête */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Notifications
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={refreshNotifications}
                                    disabled={loading}
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    title="Actualiser"
                                >
                                    <div className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                            <path d="M21 3v5h-5"/>
                                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                            <path d="M3 21v-5h5"/>
                                        </svg>
                                    </div>
                                </button>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Tout marquer comme lu
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Liste des notifications */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">Chargement des notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                Aucune notification
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const data = notification.data;
                                const isUnread = !notification.read_at;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-l-4 ${getNotificationColor(data.type)} ${
                                            isUnread ? 'bg-opacity-100' : 'bg-opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getNotificationIcon(data.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-medium ${
                                                        isUnread
                                                            ? 'text-gray-900 dark:text-gray-100'
                                                            : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                        {data.title}
                                                    </p>
                                                    <div className="flex items-center space-x-1">
                                                        {isUnread && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-gray-400 hover:text-green-600"
                                                                title="Marquer comme lu"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="text-gray-400 hover:text-red-600"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className={`text-sm mt-1 ${
                                                    isUnread
                                                        ? 'text-gray-700 dark:text-gray-300'
                                                        : 'text-gray-500 dark:text-gray-500'
                                                }`}>
                                                    {data.message}
                                                </p>
                                                {data.stock_actuel !== undefined && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Stock actuel: {data.stock_actuel} {data.unite || 'unités'}
                                                    </p>
                                                )}
                                                {/* Informations supplémentaires pour les notifications de date d'échéance */}
                                                {(data.type?.includes('due_date') || data.facture_type) && (
                                                    <div className="mt-2 space-y-1">
                                                        {data.numero_facture && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Facture: {data.numero_facture}
                                                            </p>
                                                        )}
                                                        {data.date_echeance && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Date d'échéance: {new Date(data.date_echeance).toLocaleDateString('fr-FR')}
                                                            </p>
                                                        )}
                                                        {data.montant_restant !== undefined && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Montant restant: {new Intl.NumberFormat('fr-FR').format(data.montant_restant)} DHS
                                                            </p>
                                                        )}
                                                        {data.days_overdue !== undefined && data.days_overdue > 0 && (
                                                            <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                                                                En retard de {data.days_overdue} jour(s)
                                                            </p>
                                                        )}
                                                        {data.days_until_due !== undefined && (
                                                            <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                                                                Échéance dans {data.days_until_due} jour(s)
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {formatDate(notification.created_at)}
                                                </p>
                                                {data.action_url && (
                                                    <button
                                                        onClick={() => {
                                                            router.visit(data.action_url);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
                                                    >
                                                        Voir le produit →
                                                    </button>
                                                )}
                                                {/* Bouton d'action pour les notifications de date d'échéance */}
                                                {(data.type?.includes('due_date') || data.facture_type) && data.facture_id && (
                                                    <button
                                                        onClick={() => {
                                                            const route = data.type?.includes('client') || data.facture_type === 'client'
                                                                ? `/facture-clients/${data.facture_id}`
                                                                : `/facture-fournisseurs/${data.facture_id}`;
                                                            router.visit(route);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
                                                    >
                                                        Voir la facture →
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default NotificationCenter;
