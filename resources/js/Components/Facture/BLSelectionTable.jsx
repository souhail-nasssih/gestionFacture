import { CheckCircle } from "lucide-react";

export default function BLSelectionTable({
    bls,
    selectedBLs,
    onToggleBL,
    total,
    isEditing = false
}) {
    if (bls.length === 0) {
        return (
            <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        BLs du Fournisseur
                    </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    {isEditing
                        ? "Ce fournisseur n'a aucun BL associé ou tous les BLs sont déjà associés à d'autres factures"
                        : "Aucun BL disponible pour ce fournisseur"
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    BLs du Fournisseur
                </h3>
                {selectedBLs.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {selectedBLs.length} BL{selectedBLs.length > 1 ? 's' : ''} sélectionné{selectedBLs.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Sélection
                            </th>
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
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {bls.map((bl) => (
                            <tr
                                key={bl.id}
                                className={`
                                    hover:bg-gray-50 dark:hover:bg-gray-700
                                    ${selectedBLs.includes(bl.id)
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                                        : ''
                                    }
                                `}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedBLs.includes(bl.id)}
                                        onChange={() => onToggleBL(bl.id)}
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {bl.numero_bl}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-gray-600 dark:text-gray-300">
                                        {new Date(bl.date_bl).toLocaleDateString('fr-FR')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-xs">
                                        <ul className="text-sm text-gray-600 dark:text-gray-300">
                                            {bl.details.slice(0, 2).map((detail, idx) => (
                                                <li key={idx} className="truncate">
                                                    {detail.article?.nom} ({detail.quantite} x {detail.prix_unitaire}DH)
                                                </li>
                                            ))}
                                            {bl.details.length > 2 && (
                                                <li className="text-indigo-600 dark:text-indigo-400 font-medium">
                                                    +{bl.details.length - 2} autre(s) article(s)
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {bl.details
                                            .reduce(
                                                (sum, detail) =>
                                                    sum + detail.quantite * detail.prix_unitaire,
                                                0
                                            )
                                            .toFixed(2)} DH
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {selectedBLs.length > 0 && (
                        <tfoot className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-200 dark:border-gray-600">
                            <tr>
                                <td
                                    colSpan="4"
                                    className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white"
                                >
                                    Total sélectionné:
                                </td>
                                <td className="px-6 py-4 font-bold text-lg text-green-600 dark:text-green-400">
                                    {total} DH
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {selectedBLs.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                BLs sélectionnés
                            </h3>
                            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                <p>
                                    Vous avez sélectionné {selectedBLs.length} bon(s) de livraison pour un total de {total} DH.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
