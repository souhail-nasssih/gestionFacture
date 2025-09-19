import { Eye, Edit2, Trash2, ChevronDown, ChevronRight, Printer } from "lucide-react";
import { useState } from "react";

export default function FactureRow({
    item,
    isExpanded,
    onToggleExpand,
    onEdit,
    onDelete,
}) {
    const [localExpanded, setLocalExpanded] = useState(false);

    const handleToggleExpand = () => {
        if (onToggleExpand) {
            onToggleExpand();
        } else {
            setLocalExpanded(!localExpanded);
        }
    };

    const handlePrint = () => {
        // Ouvrir la facture dans un nouvel onglet pour l'impression
        const printUrl = `/facture-fournisseurs/${item.id}/print`;
        window.open(printUrl, '_blank');
    };

    const expanded = onToggleExpand ? isExpanded : localExpanded;

    const calculateBlTotal = (bl) => {
        return bl.details
            .reduce(
                (sum, detail) => sum + detail.quantite * detail.prix_unitaire,
                0
            )
            .toFixed(2);
    };

    return (
        <>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-300">
                        <span className="font-mono text-gray-500 dark:text-gray-400">
                            #{item.id}
                        </span>
                    </span>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                        {item.numero_facture}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-300">
                        {new Date(item.date_facture).toLocaleDateString(
                            "fr-FR"
                        )}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-300">
                        {(() => {
                            let dateEcheance;
                            if (item.date_echeance && item.date_echeance !== '0000-00-00' && item.date_echeance !== 'null' && item.date_echeance !== null) {
                                dateEcheance = new Date(item.date_echeance);
                            } else if (item.date_facture) {
                                const dateFacture = new Date(item.date_facture);
                                dateEcheance = new Date(dateFacture);
                                if (item.fournisseur?.delai_paiement) {
                                    dateEcheance.setDate(dateFacture.getDate() + parseInt(item.fournisseur.delai_paiement));
                                }
                            }
                            return dateEcheance ? dateEcheance.toLocaleDateString("fr-FR") : '-';
                        })()}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 dark:text-gray-300">
                        {item.fournisseur?.nom || "N/A"}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {(item.bonsLivraison?.length ?? item.bons_livraison?.length ?? 0)}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-green-600 dark:text-green-400">
                        {item.montant_total} DH
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                        <button
                            onClick={handleToggleExpand}
                            className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                            title={
                                expanded
                                    ? "Masquer les détails"
                                    : "Afficher les détails"
                            }
                        >
                            {expanded ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            onClick={() => onEdit(item)}
                            className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                            title="Modifier cette facture"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(item)}
                            className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                            title="Supprimer cette facture"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handlePrint}
                            className="p-1 text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full"
                            title="Imprimer cette facture"
                        >
                            <Printer className="h-4 w-4" />
                        </button>
                    </div>
                </td>
            </tr>

            {expanded && (
                <tr className="bg-gray-50 dark:bg-gray-700">
                    <td colSpan="7" className="px-6 py-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    Détails de la Facture #{item.id}
                                </h4>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Créée le{" "}
                                    {new Date(
                                        item.created_at
                                    ).toLocaleDateString("fr-FR")}
                                </span>
                            </div>

                            {item.bons_livraison?.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                        <thead className="bg-gray-100 dark:bg-gray-600">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Numéro BL
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Date BL
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Articles
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Montant (DH)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                            {item.bons_livraison.map((bl) => (
                                                <tr
                                                    key={bl.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {bl.numero_bl}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-gray-600 dark:text-gray-300">
                                                            {new Date(
                                                                bl.date_bl
                                                            ).toLocaleDateString(
                                                                "fr-FR"
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="max-w-md">
                                                            <ul className="space-y-1">
                                                                {bl.details.map(
                                                                    (
                                                                        detail,
                                                                        idx
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="text-sm text-gray-600 dark:text-gray-300 flex justify-between"
                                                                        >
                                                                            <span className="truncate">
                                                                                {
                                                                                    detail
                                                                                        .produit
                                                                                        ?.nom
                                                                                }
                                                                            </span>
                                                                            <span className="ml-2 font-medium">
                                                                                {
                                                                                    detail.quantite
                                                                                }{" "}
                                                                                x{" "}
                                                                                {
                                                                                    detail.prix_unitaire
                                                                                }{" "}
                                                                                DH
                                                                            </span>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-medium text-green-600 dark:text-green-400">
                                                            {calculateBlTotal(
                                                                bl
                                                            )}{" "}
                                                            DH
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                            <tr>
                                                <td
                                                    colSpan="3"
                                                    className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white"
                                                >
                                                    Total de la facture:
                                                </td>
                                                <td className="px-6 py-4 font-bold text-lg text-green-600 dark:text-green-400">
                                                    {Number(
                                                        item.montant_total
                                                    ).toFixed(2)}{" "}
                                                    DH
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Aucun BL associé à cette facture
                                    </p>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
