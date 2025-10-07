import { Link } from '@inertiajs/react';

export default function DeleteModal({ bl, onClose, routeName, title = "BL" }) {
    // Vérifier si le BL est associé à une facture
    const isAssociatedWithFacture = bl?.facture_client_id !== null && bl?.facture_client_id !== undefined;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Confirmer la suppression
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Êtes-vous sûr de vouloir supprimer le {title} n°
                    <span className="font-semibold">{bl?.numero_bl}</span> ?
                    Cette action est irréversible.
                </p>

                {/* Message d'avertissement si associé à une facture */}
                {isAssociatedWithFacture && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Attention : BL associé à une facture
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        Ce BL est associé à une facture. Si cette facture ne contient que ce BL,
                                        elle sera également supprimée automatiquement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
