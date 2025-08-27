import { Link } from "@inertiajs/react";
import { X, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function DeleteModal({ facture, onClose, onSuccess }) {
    // Close modal on Escape key press
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Confirmer la suppression
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Êtes-vous sûr de vouloir supprimer la facture fournisseur n°{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                            {facture?.numero_facture}
                        </span>
                        {" "}du fournisseur{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                            {facture?.fournisseur?.nom}
                        </span> ?
                    </p>

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-300" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Action irréversible
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    <p>
                                        Cette action supprimera définitivement la facture et ne pourra pas être annulée.
                                        {facture?.bonsLivraison?.length > 0 && (
                                            <span className="block mt-1">
                                                Les {facture.bonsLivraison.length} BL(s) associé(s) seront dissocié(s) de cette facture.
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col sm:flex-row-reverse sm:justify-start sm:space-x-reverse sm:space-x-3">
                    <Link
                        href={route("factures-fournisseurs.destroy", facture?.id)}
                        method="delete"
                        as="button"
                        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors"
                        onSuccess={onSuccess}
                    >
                        Supprimer définitivement
                    </Link>
                    <button
                        onClick={onClose}
                        className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}
