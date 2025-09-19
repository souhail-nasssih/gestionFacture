import { useState } from "react";
import FactureRow from "./FactureRow";

export default function FactureTable({ facturesFournisseurs, onEdit, onDelete }) {
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRowExpansion = (factureId) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(factureId)) {
                newSet.delete(factureId);
            } else {
                newSet.add(factureId);
            }
            return newSet;
        });
    };

    if (!facturesFournisseurs?.data?.length) {
        return (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full mb-4">
                        <svg
                            className="w-12 h-12 text-gray-400 dark:text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucune facture trouvée
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Commencez par créer votre première facture fournisseur.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                ID
                            </th> */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Numéro Facture
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date Facture
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date d'échéance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Fournisseur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Nb. BLs
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Montant Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {facturesFournisseurs.data.map((item) => (
                            <FactureRow
                                key={item.id}
                                item={item}
                                isExpanded={expandedRows.has(item.id)}
                                onToggleExpand={() => toggleRowExpansion(item.id)}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {facturesFournisseurs.meta && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Affichage de{" "}
                            <span className="font-medium">
                                {facturesFournisseurs.meta.from}
                            </span>{" "}
                            à{" "}
                            <span className="font-medium">
                                {facturesFournisseurs.meta.to}
                            </span>{" "}
                            sur{" "}
                            <span className="font-medium">
                                {facturesFournisseurs.meta.total}
                            </span>{" "}
                            résultats
                        </div>

                        <div className="flex space-x-2">
                            {/* Previous Page Button */}
                            <button
                                onClick={() => {
                                    if (facturesFournisseurs.links.prev) {
                                        window.location.href = facturesFournisseurs.links.prev;
                                    }
                                }}
                                disabled={!facturesFournisseurs.links.prev}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Précédent
                            </button>

                            {/* Page Numbers */}
                            <div className="hidden md:flex space-x-1">
                                {facturesFournisseurs.meta.links.map((link, index) => {
                                    if (index === 0 || index === facturesFournisseurs.meta.links.length - 1) return null;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (link.url) {
                                                    window.location.href = link.url;
                                                }
                                            }}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                                link.active
                                                    ? "text-white bg-indigo-600 border border-indigo-600"
                                                    : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500"
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Next Page Button */}
                            <button
                                onClick={() => {
                                    if (facturesFournisseurs.links.next) {
                                        window.location.href = facturesFournisseurs.links.next;
                                    }
                                }}
                                disabled={!facturesFournisseurs.links.next}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
