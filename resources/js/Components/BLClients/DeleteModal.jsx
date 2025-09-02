import { Link } from '@inertiajs/react';

export default function DeleteModal({ bl, onClose, routeName, title = "BL" }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Confirmer la suppression
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Êtes-vous sûr de vouloir supprimer le {title} n°
                    <span className="font-semibold">{bl?.numero_bl}</span> ?
                    Cette action est irréversible.
                </p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Annuler
                    </button>

                    <Link
                        href={route(routeName, bl?.id)}
                        method="delete"
                        as="button"
                        className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        preserveScroll
                        onSuccess={onClose}
                    >
                        Supprimer
                    </Link>
                </div>
            </div>
        </div>
    );
}
